@echo off
set DATABASE_URL=postgres://postgres:postgres@localhost:5432/dentalsoft
cd /d C:\htdocs\DentalSoft 31052026
node node_modules\tsx\dist\cli.mjs server\index.ts
