function Add-Path([string]$Path) {
    $Env:Path += [IO.Path]::PathSeparator + $Path
    $command = "[Environment]::SetEnvironmentVariable('PATH', '$Env:Path', 'Machine')"
    Start-Process powershell -ArgumentList "-command $Command" -Verb runas
}
