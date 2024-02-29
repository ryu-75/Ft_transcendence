#!/bin/sh

npm run prisma:push
exec node dist/main.js
