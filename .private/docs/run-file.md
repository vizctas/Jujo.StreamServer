flutter run -d windows --dart-define=SUPABASE_URL=https://faadppubtdxjnnvubnsi.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_xSfpJSBypMPXXCWeeYBgVQ_U6gu57NH --dart-define=SUPABASE_EMAIL_REDIRECT_TO=https://vizctas.github.io/jujostream/welcome.html


flutter build apk --release --dart-define=SUPABASE_URL=https://faadppubtdxjnnvubnsi.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_xSfpJSBypMPXXCWeeYBgVQ_U6gu57NH


Issues found on server execution test: 
1. Dashboard: Lines on activity are not drawing or maybe colors are wrong. (Using Lazy Ankui color scheme)
2. Steam isnt connected when I login but games still present on my library. Two things with this issue, 2.1 Im afraid of losing connection status on game source on every boot. 2.2 If the connection is ok. Then if a game source isnt connected there should not be any game synced. also 2.3 Game sources took so long to show the page completly.


Important: WAN route works only if xxx.xxx.xxx.xxx:47990 reaches server from outside network. That needs UPnP/port-forward/relay. Cloud can publish WAN IP, but cannot make router accept traffic by itself.