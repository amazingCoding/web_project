# BaseWeb
## 项目架构
```
├── app
│   ├── app.common.css // 公用样式
│   ├── app.html // 主要 HTML
│   ├── app.tsx //主要入口
│   ├── components // 组件入口 
│   ├── config // 配置
│   ├── router // 路由，主要 UI 在这里
│   ├── store  // 数据
│   └── typings.d.ts // 全局的typescript declare 
├── package.json
├── dll      // 分离和版本无关的常用第三方库
├── webpack        // webpack 第三方插件
├── tsconfig.json     // tsconfig 配置
└── webpack.config.js //  webpack 打包配置
```
## 使用
  * `chmod 755 pull.sh` 设置权限，直接  `./pull.sh "commit msg"` 可以提交代码
## 部署
nginx 版。
如果遇到配置时候 `500` / `403`。请留意 `nginx` 的 `user` 配置。赋予目录 `777` 权限
* 开启 GZIP
* HTML 不要进行缓存
```nginx
server {
  listen 8080;
  root /root/XXX/build;
  index index.html index.htm;
  location / {
    try_files $uri $uri/ /index.html;
  }
  ## 静态资源最好采用 CDN 隔离
  location ^~ /assets/ {
    gzip_static on;
    expires max;
    add_header Cache-Control public;
  }
  error_page 500 502 503 504 /500.html;
  client_max_body_size 20M;
  keepalive_timeout 10;
}
```