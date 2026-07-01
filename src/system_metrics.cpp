/**
 * @file src/system_metrics.cpp
 * @brief Implementation of lightweight system metrics collection (Windows).
 */

#include "system_metrics.h"
#include "logging.h"

#ifdef _WIN32
  #ifndef WIN32_LEAN_AND_MEAN
    #define WIN32_LEAN_AND_MEAN
  #endif
  #ifndef NTDDI_VERSION
    #define NTDDI_VERSION 0x0A000000  // NTDDI_WIN10
  #endif
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #include <Windows.h>
  #include <Psapi.h>
  #include <iphlpapi.h>
  #include <netioapi.h>
  #include <comdef.h>
  #include <Wbemidl.h>
  #include <Pdh.h>
  #include <PdhMsg.h>

  #include "platform/windows/misc.h"

  // These libs are linked via CMake (cmake/compile_definitions/windows.cmake).
  // The #pragma comment directives below are MSVC-only and silently ignored by
  // GCC, so guard them to suppress -Wunknown-pragmas on MinGW/UCRT64 builds.
  #ifdef _MSC_VER
  #  pragma comment(lib, "iphlpapi.lib")
  #  pragma comment(lib, "wbemuuid.lib")
  #  pragma comment(lib, "ole32.lib")
  #  pragma comment(lib, "oleaut32.lib")
  #  pragma comment(lib, "pdh.lib")
  #endif
#endif

#include <algorithm>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <mutex>
#include <optional>
#include <string>
#include <vector>

namespace system_metrics {

#ifdef _WIN32

  // ─── CPU Usage (system-wide) via GetSystemTimes delta ──────────────────────────

  struct cpu_state_t {
    std::mutex mtx;
    ULARGE_INTEGER prev_idle {};
    ULARGE_INTEGER prev_kernel {};
    ULARGE_INTEGER prev_user {};
    double usage_percent {0.0};
    bool initialized {false};
  };

  static cpu_state_t &cpu_state() {
    static cpu_state_t s;
    return s;
  }

  static double sample_cpu_usage() {
    auto &state = cpu_state();
    std::lock_guard lk(state.mtx);

    FILETIME idle_ft, kernel_ft, user_ft;
    if (!GetSystemTimes(&idle_ft, &kernel_ft, &user_ft)) {
      return state.usage_percent;
    }

    ULARGE_INTEGER idle, kernel, user;
    idle.LowPart = idle_ft.dwLowDateTime;
    idle.HighPart = idle_ft.dwHighDateTime;
    kernel.LowPart = kernel_ft.dwLowDateTime;
    kernel.HighPart = kernel_ft.dwHighDateTime;
    user.LowPart = user_ft.dwLowDateTime;
    user.HighPart = user_ft.dwHighDateTime;

    if (!state.initialized) {
      state.prev_idle = idle;
      state.prev_kernel = kernel;
      state.prev_user = user;
      state.initialized = true;
      return 0.0;
    }

    uint64_t idle_delta = idle.QuadPart - state.prev_idle.QuadPart;
    uint64_t kernel_delta = kernel.QuadPart - state.prev_kernel.QuadPart;
    uint64_t user_delta = user.QuadPart - state.prev_user.QuadPart;
    uint64_t total = kernel_delta + user_delta;

    if (total == 0) return state.usage_percent;

    double usage = (1.0 - static_cast<double>(idle_delta) / static_cast<double>(total)) * 100.0;
    if (usage < 0.0) usage = 0.0;
    if (usage > 100.0) usage = 100.0;

    state.prev_idle = idle;
    state.prev_kernel = kernel;
    state.prev_user = user;
    state.usage_percent = usage;
    return usage;
  }

  // ─── Process CPU Usage ─────────────────────────────────────────────────────────

  struct process_cpu_state_t {
    std::mutex mtx;
    ULARGE_INTEGER prev_process_time {};
    ULARGE_INTEGER prev_system_time {};
    double usage_percent {0.0};
    bool initialized {false};
    int processor_count {1};
  };

  static process_cpu_state_t &process_cpu_state() {
    static process_cpu_state_t s;
    return s;
  }

  static double sample_process_cpu() {
    auto &state = process_cpu_state();
    std::lock_guard lk(state.mtx);

    FILETIME creation, exit_time, kernel, user;
    if (!GetProcessTimes(GetCurrentProcess(), &creation, &exit_time, &kernel, &user)) {
      return state.usage_percent;
    }

    ULARGE_INTEGER k, u;
    k.LowPart = kernel.dwLowDateTime;
    k.HighPart = kernel.dwHighDateTime;
    u.LowPart = user.dwLowDateTime;
    u.HighPart = user.dwHighDateTime;

    ULARGE_INTEGER process_time;
    process_time.QuadPart = k.QuadPart + u.QuadPart;

    FILETIME now_ft;
    GetSystemTimeAsFileTime(&now_ft);
    ULARGE_INTEGER now;
    now.LowPart = now_ft.dwLowDateTime;
    now.HighPart = now_ft.dwHighDateTime;

    if (!state.initialized) {
      SYSTEM_INFO sys_info {};
      GetSystemInfo(&sys_info);
      state.processor_count = sys_info.dwNumberOfProcessors > 0 ? sys_info.dwNumberOfProcessors : 1;
      state.prev_process_time = process_time;
      state.prev_system_time = now;
      state.initialized = true;
      return 0.0;
    }

    uint64_t process_delta = process_time.QuadPart - state.prev_process_time.QuadPart;
    uint64_t system_delta = now.QuadPart - state.prev_system_time.QuadPart;

    if (system_delta == 0) return state.usage_percent;

    double usage = (static_cast<double>(process_delta) / static_cast<double>(system_delta)) * 100.0 / state.processor_count;
    if (usage < 0.0) usage = 0.0;
    if (usage > 100.0) usage = 100.0;

    state.prev_process_time = process_time;
    state.prev_system_time = now;
    state.usage_percent = usage;
    return usage;
  }

  // ─── Memory ────────────────────────────────────────────────────────────────────

  static nlohmann::json collect_memory() {
    nlohmann::json mem;

    MEMORYSTATUSEX ms {};
    ms.dwLength = sizeof(ms);
    if (GlobalMemoryStatusEx(&ms)) {
      mem["loadPercent"] = static_cast<int>(ms.dwMemoryLoad);
      mem["totalBytes"] = ms.ullTotalPhys;
      mem["availBytes"] = ms.ullAvailPhys;
    }

    PROCESS_MEMORY_COUNTERS_EX pmc {};
    pmc.cb = sizeof(pmc);
    if (GetProcessMemoryInfo(GetCurrentProcess(), reinterpret_cast<PROCESS_MEMORY_COUNTERS *>(&pmc), sizeof(pmc))) {
      mem["processWorkingSetBytes"] = pmc.WorkingSetSize;
      mem["processPrivateBytes"] = pmc.PrivateUsage;
    }

    return mem;
  }

  // ─── Network I/O ───────────────────────────────────────────────────────────────

  static nlohmann::json collect_network() {
    nlohmann::json net;

    MIB_IF_TABLE2 *table = nullptr;
    if (GetIfTable2(&table) == NO_ERROR && table) {
      uint64_t total_sent = 0;
      uint64_t total_recv = 0;

      for (ULONG i = 0; i < table->NumEntries; ++i) {
        const auto &row = table->Table[i];
        if (row.Type == IF_TYPE_SOFTWARE_LOOPBACK) continue;
        if (row.OperStatus != IfOperStatusUp) continue;
        total_sent += row.OutOctets;
        total_recv += row.InOctets;
      }

      FreeMibTable(table);
      net["bytesSentTotal"] = total_sent;
      net["bytesRecvTotal"] = total_recv;
    }

    return net;
  }

  // ─── GPU (NVIDIA via NvAPI) ────────────────────────────────────────────────────

  struct gpu_state_t {
    std::mutex mtx;
    bool attempted_init {false};
    bool available {false};

    using QueryInterface_t = void *(*)(unsigned int);
    using NvInit_t = int (*)();
    using NvEnumGPUs_t = int (*)(void *handles[64], unsigned long *count);
    using NvThermal_t = int (*)(void *handle, int sensorIndex, void *settings);

    NvInit_t fn_init {nullptr};
    NvEnumGPUs_t fn_enum {nullptr};
    NvThermal_t fn_thermal {nullptr};

    void *handles[64] {};
    unsigned long count {0};
  };

  static gpu_state_t &gpu_state() {
    static gpu_state_t s;
    return s;
  }

  static void try_init_nvapi() {
    auto &state = gpu_state();
    if (state.attempted_init) return;
    state.attempted_init = true;

    HMODULE mod = LoadLibraryW(L"nvapi64.dll");
    if (!mod) mod = LoadLibraryW(L"nvapi.dll");
    if (!mod) return;

    auto query = reinterpret_cast<gpu_state_t::QueryInterface_t>(GetProcAddress(mod, "nvapi_QueryInterface"));
    if (!query) query = reinterpret_cast<gpu_state_t::QueryInterface_t>(GetProcAddress(mod, "NvAPI_QueryInterface"));
    if (!query) return;

    state.fn_init = reinterpret_cast<gpu_state_t::NvInit_t>(query(0x0150E828));
    state.fn_enum = reinterpret_cast<gpu_state_t::NvEnumGPUs_t>(query(0xE5AC921F));
    state.fn_thermal = reinterpret_cast<gpu_state_t::NvThermal_t>(query(0xE3640A56));

    if (!state.fn_init || !state.fn_enum) return;
    if (state.fn_init() != 0) return;
    if (state.fn_enum(state.handles, &state.count) != 0 || state.count == 0) return;

    state.available = true;
  }

  // ─── GPU utilization/VRAM (vendor-agnostic via PDH) ─────────────────────────────
  //
  // Windows exposes GPU engine/memory counters at the OS/driver level (DXGK), not
  // behind a vendor SDK, so these work identically on NVIDIA/AMD/Intel. GPU
  // temperature has no such vendor-agnostic API, so it stays NvAPI-only (above) —
  // AMD/Intel report temperatureC: null rather than a value we can't validate.

  struct gpu_pdh_state_t {
    std::mutex mtx;
    bool attempted_init {false};
    bool available {false};
    PDH_HQUERY query {nullptr};
    PDH_HCOUNTER util_counter {nullptr};  // \GPU Engine(*)\Utilization Percentage
    PDH_HCOUNTER mem_counter {nullptr};  // \GPU Adapter Memory(*)\Dedicated Usage
  };

  static gpu_pdh_state_t &gpu_pdh_state() {
    static gpu_pdh_state_t s;
    return s;
  }

  static void try_init_gpu_pdh() {
    auto &state = gpu_pdh_state();
    if (state.attempted_init) return;
    state.attempted_init = true;

    if (PdhOpenQueryW(nullptr, 0, &state.query) != ERROR_SUCCESS) return;

    if (PdhAddEnglishCounterW(state.query, L"\\GPU Engine(*)\\Utilization Percentage", 0, &state.util_counter) != ERROR_SUCCESS) {
      PdhCloseQuery(state.query);
      state.query = nullptr;
      return;
    }
    // Memory counter is best-effort; utilization alone is still useful without it.
    PdhAddEnglishCounterW(state.query, L"\\GPU Adapter Memory(*)\\Dedicated Usage", 0, &state.mem_counter);

    state.available = true;
  }

  // "Utilization Percentage" is a time-based counter: like CPU%, it needs a
  // previous sample to compute a rate. PdhCollectQueryData keeps that state
  // inside the query handle across calls (the handle is a static, so each
  // invocation here is one more sample relative to the last — mirrors the
  // persistent-state pattern the CPU counter above already uses), so the first
  // call after startup returns no data; subsequent calls return real values.
  //
  // ponytail: sums every engine instance under the first LUID seen and clamps at
  // 100 rather than doing full per-adapter LUID disambiguation — matches the
  // single-GPU assumption the NvAPI path above already makes (state.handles[0]).
  // Revisit if/when multi-GPU selection is added anywhere else in this codebase.
  static std::optional<int> read_gpu_utilization_percent() {
    auto &state = gpu_pdh_state();
    if (!state.available) return std::nullopt;
    if (PdhCollectQueryData(state.query) != ERROR_SUCCESS) return std::nullopt;

    DWORD buffer_size = 0, item_count = 0;
    auto status = PdhGetFormattedCounterArrayW(state.util_counter, PDH_FMT_DOUBLE, &buffer_size, &item_count, nullptr);
    if (status != PDH_MORE_DATA || buffer_size == 0) return std::nullopt;

    std::vector<uint8_t> buffer(buffer_size);
    auto *items = reinterpret_cast<PDH_FMT_COUNTERVALUE_ITEM_W *>(buffer.data());
    if (PdhGetFormattedCounterArrayW(state.util_counter, PDH_FMT_DOUBLE, &buffer_size, &item_count, items) != ERROR_SUCCESS) {
      return std::nullopt;
    }

    std::wstring first_luid;
    double total = 0.0;
    for (DWORD i = 0; i < item_count; ++i) {
      if (items[i].FmtValue.CStatus != ERROR_SUCCESS) continue;
      std::wstring name = items[i].szName;
      auto luid_pos = name.find(L"luid_");
      if (luid_pos == std::wstring::npos) continue;
      auto phys_pos = name.find(L"_phys_", luid_pos);
      std::wstring luid = phys_pos == std::wstring::npos ? name.substr(luid_pos) : name.substr(luid_pos, phys_pos - luid_pos);
      if (first_luid.empty()) first_luid = luid;
      if (luid != first_luid) continue;
      total += items[i].FmtValue.doubleValue;
    }

    return static_cast<int>(std::clamp(total, 0.0, 100.0));
  }

  static std::optional<uint64_t> read_gpu_dedicated_memory_used_bytes() {
    auto &state = gpu_pdh_state();
    if (!state.available || !state.mem_counter) return std::nullopt;

    DWORD buffer_size = 0, item_count = 0;
    auto status = PdhGetFormattedCounterArrayW(state.mem_counter, PDH_FMT_LARGE, &buffer_size, &item_count, nullptr);
    if (status != PDH_MORE_DATA || buffer_size == 0) return std::nullopt;

    std::vector<uint8_t> buffer(buffer_size);
    auto *items = reinterpret_cast<PDH_FMT_COUNTERVALUE_ITEM_W *>(buffer.data());
    if (PdhGetFormattedCounterArrayW(state.mem_counter, PDH_FMT_LARGE, &buffer_size, &item_count, items) != ERROR_SUCCESS) {
      return std::nullopt;
    }
    for (DWORD i = 0; i < item_count; ++i) {
      if (items[i].FmtValue.CStatus != ERROR_SUCCESS) continue;
      // First adapter instance — matches the single-GPU assumption above.
      return static_cast<uint64_t>(items[i].FmtValue.largeValue);
    }
    return std::nullopt;
  }

  static nlohmann::json collect_gpu() {
    nlohmann::json gpu;

    auto &nv = gpu_state();
    auto &pdh = gpu_pdh_state();

    // Temperature: NVIDIA-only via NvAPI. There's no vendor-agnostic Windows API
    // for GPU temperature; AMD/Intel would need their own vendor SDK, which we
    // have no hardware to validate — report null honestly rather than guess.
    bool nv_available = false;
    std::optional<int> nv_temp;
    {
      std::lock_guard lk(nv.mtx);
      try_init_nvapi();
      nv_available = nv.available;
      if (nv_available && nv.fn_thermal) {
        struct { unsigned int version; unsigned int count; struct { int ctrl; int minT; int maxT; int curT; int tgt; } s[3]; } ts {};
        ts.version = sizeof(ts) | (2 << 16);
        if (nv.fn_thermal(nv.handles[0], 0, &ts) == 0 && ts.count > 0) {
          nv_temp = ts.s[0].curT;
        }
      }
    }

    // Utilization + VRAM used: vendor-agnostic via PDH (works for NVIDIA too).
    std::optional<int> util;
    std::optional<uint64_t> vram_used;
    {
      std::lock_guard lk(pdh.mtx);
      try_init_gpu_pdh();
      util = read_gpu_utilization_percent();
      vram_used = read_gpu_dedicated_memory_used_bytes();
    }

    // Name + total VRAM: DXGI enumeration (vendor-agnostic), not NvAPI's calls,
    // so AMD/Intel get a real name/VRAM total instead of being left blank.
    auto gpus = platf::enumerate_gpus();

    if (gpus.empty() && !nv_available) {
      gpu["available"] = false;
      return gpu;
    }
    gpu["available"] = true;

    if (!gpus.empty()) {
      gpu["name"] = gpus.front().description;
      gpu["vramTotalBytes"] = gpus.front().dedicated_video_memory > 0 ?
                                 nlohmann::json(gpus.front().dedicated_video_memory) :
                                 nlohmann::json(nullptr);
    } else {
      gpu["name"] = nullptr;
      gpu["vramTotalBytes"] = nullptr;
    }

    gpu["temperatureC"] = nv_temp ? nlohmann::json(*nv_temp) : nlohmann::json(nullptr);
    gpu["usagePercent"] = util ? nlohmann::json(*util) : nlohmann::json(nullptr);
    gpu["vramUsedBytes"] = vram_used ? nlohmann::json(*vram_used) : nlohmann::json(nullptr);

    return gpu;
  }

  // ─── CPU Temperature (WMI) ─────────────────────────────────────────────────────

  struct wmi_state_t {
    std::mutex mtx;
    bool attempted {false};
    bool available {false};
    IWbemLocator *locator {nullptr};
    IWbemServices *services {nullptr};
  };

  static wmi_state_t &wmi_state() {
    static wmi_state_t s;
    return s;
  }

  static void try_init_wmi() {
    auto &state = wmi_state();
    if (state.attempted) return;
    state.attempted = true;

    HRESULT hr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    if (FAILED(hr) && hr != RPC_E_CHANGED_MODE) return;

    CoInitializeSecurity(nullptr, -1, nullptr, nullptr, RPC_C_AUTHN_LEVEL_DEFAULT,
                         RPC_C_IMP_LEVEL_IMPERSONATE, nullptr, EOAC_NONE, nullptr);

    hr = CoCreateInstance(CLSID_WbemLocator, nullptr, CLSCTX_INPROC_SERVER,
                          IID_IWbemLocator, reinterpret_cast<void **>(&state.locator));
    if (FAILED(hr) || !state.locator) return;

    hr = state.locator->ConnectServer(
      _bstr_t(L"ROOT\\WMI"), nullptr, nullptr, nullptr, 0, nullptr, nullptr, &state.services);
    if (FAILED(hr) || !state.services) {
      state.locator->Release();
      state.locator = nullptr;
      return;
    }

    CoSetProxyBlanket(state.services, RPC_C_AUTHN_WINNT, RPC_C_AUTHZ_NONE, nullptr,
                      RPC_C_AUTHN_LEVEL_CALL, RPC_C_IMP_LEVEL_IMPERSONATE, nullptr, EOAC_NONE);
    state.available = true;
  }

  static nlohmann::json collect_cpu_temperature() {
    auto &state = wmi_state();
    std::lock_guard lk(state.mtx);
    try_init_wmi();

    if (!state.available) return nullptr;

    IEnumWbemClassObject *enumerator = nullptr;
    HRESULT hr = state.services->ExecQuery(
      _bstr_t(L"WQL"),
      _bstr_t(L"SELECT CurrentTemperature FROM MSAcpi_ThermalZoneTemperature"),
      WBEM_FLAG_FORWARD_ONLY | WBEM_FLAG_RETURN_IMMEDIATELY,
      nullptr, &enumerator);

    if (FAILED(hr) || !enumerator) return nullptr;

    IWbemClassObject *obj = nullptr;
    ULONG returned = 0;
    double max_temp_c = 0.0;
    bool found = false;

    while (enumerator->Next(200, 1, &obj, &returned) == WBEM_S_NO_ERROR && returned > 0) {
      VARIANT var;
      VariantInit(&var);
      if (SUCCEEDED(obj->Get(L"CurrentTemperature", 0, &var, nullptr, nullptr))) {
        if (var.vt == VT_I4 || var.vt == VT_UI4) {
          double temp_c = (static_cast<double>(var.lVal) / 10.0) - 273.15;
          if (temp_c > max_temp_c) max_temp_c = temp_c;
          found = true;
        }
        VariantClear(&var);
      }
      obj->Release();
    }
    enumerator->Release();

    if (found && max_temp_c > 0.0 && max_temp_c < 150.0) {
      return nlohmann::json(static_cast<int>(max_temp_c));
    }
    return nullptr;
  }

  // ─── Main collect() ────────────────────────────────────────────────────────────

  nlohmann::json collect() {
    nlohmann::json result;

    auto epoch = std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()).count();
    result["timestamp"] = epoch;

    result["cpu"]["usagePercent"] = sample_cpu_usage();
    result["cpu"]["processPercent"] = sample_process_cpu();
    result["cpu"]["temperatureC"] = collect_cpu_temperature();

    result["memory"] = collect_memory();
    result["gpu"] = collect_gpu();
    result["network"] = collect_network();

    return result;
  }

#else
  nlohmann::json collect() {
    nlohmann::json result;
    result["timestamp"] = std::chrono::duration_cast<std::chrono::seconds>(
      std::chrono::system_clock::now().time_since_epoch()).count();
    result["error"] = "system_metrics only supported on Windows";
    return result;
  }
#endif

}  // namespace system_metrics
