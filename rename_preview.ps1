$files = Get-ChildItem -Recurse -File -Force | Where-Object { $_.Name -like '*-*' }
$rows = foreach ($f in $files) {
  $old = $f.FullName
  $new = Join-Path $f.DirectoryName ($f.Name -replace '-', '_')
  [PSCustomObject]@{OldFullName=$old;NewFullName=$new}
}
$rows | Export-Csv -Path 'rename_plan_all.csv' -NoTypeInformation -Encoding UTF8
Write-Output ("FOUND:{0}" -f $rows.Count)
