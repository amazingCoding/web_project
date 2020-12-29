msg=$1  # $1为第一个参数
if [ -n "$msg" ]; then
  git add -A
  git commit -m"${msg}"
  git push origin master
  git status
else
    echo "msg is null"
fi