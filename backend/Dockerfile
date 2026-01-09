# 阶段1：构建后端应用
FROM node:18-alpine AS build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 阶段2：运行应用
FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制构建产物
COPY --from=build /app/dist ./dist

# 复制环境变量配置文件
COPY .env.example .env

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]
