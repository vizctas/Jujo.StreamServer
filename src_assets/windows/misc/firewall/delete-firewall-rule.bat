@echo off

set RULE_NAME=Jujo.Stream Server

rem Delete the rule
netsh advfirewall firewall delete rule name=%RULE_NAME%
