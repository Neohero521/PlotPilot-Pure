#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# PlotPilot Pure - 纯前端完整版
# Fork from: https://github.com/shenminglinyi/PlotPilot
# ============================================================

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${CYAN}${BOLD}=== PlotPilot Pure 安装程序 ===${NC}"
echo -e "基于 PlotPilot 改造的纯前端版本\n"

# 检查 Termux
if [ -z "$PREFIX" ]; then
    echo -e "${RED}请在 Termux 中运行${NC}"
    exit 1
fi

# 安装 Node.js
if ! command -v node >/dev/null; then
    echo -e "${YELLOW}安装 Node.js...${NC}"
    pkg install -y nodejs-lts
fi

# 下载项目
INSTALL_DIR="$HOME/PlotPilot-Pure"
REPO_URL="https://github.com/Neohero521/PlotPilot-Pure"

if [ -d "$INSTALL_DIR/.git" ]; then
    echo -e "${YELLOW}更新项目...${NC}"
    cd "$INSTALL_DIR" && git pull
else
    echo -e "${YELLOW}下载 PlotPilot Pure...${NC}"
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" || {
        echo -e "${RED}下载失败，尝试备用方式...${NC}"
        mkdir -p "$INSTALL_DIR/frontend/src"
        cd "$INSTALL_DIR"
        
        # 手动下载关键文件
        for file in frontend/package.json frontend/vite.config.js frontend/index.html; do
            curl -fsSL -o "$file" "$REPO_URL/raw/main/$file" 2>/dev/null || true
        done
    }
fi

# 安装依赖
cd "$INSTALL_DIR/frontend" || exit 1
echo -e "${CYAN}安装依赖（可能需要几分钟）...${NC}"
npm config set registry https://registry.npmmirror.com
npm install --no-audit --no-fund --loglevel=error

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}重试安装...${NC}"
    npm install --no-audit --no-fund --loglevel=error
fi

# 创建启动脚本
cat > "$HOME/plotpilot-pure" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd "$HOME/PlotPilot-Pure/frontend" || exit 1

if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install --registry https://registry.npmmirror.com --no-audit
fi

# 获取 IP
IP=$(ip addr show wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 || echo "localhost")

echo ""
echo "====================================="
echo "  PlotPilot Pure 启动成功！"
echo "====================================="
echo ""
echo "📱 手机访问: http://localhost:5173"
echo "🌐 局域网访问: http://$IP:5173"
echo ""
echo "按 Ctrl+C 停止"
echo "====================================="
echo ""

npm run dev -- --host 2>&1 | while read line; do
    echo "$line"
    if echo "$line" | grep -q "5173"; then
        termux-open-url "http://localhost:5173" 2>/dev/null || true
    fi
done
EOF

chmod +x "$HOME/plotpilot-pure"

# 添加到 .bashrc
if ! grep -q "plotpilot-pure" "$HOME/.bashrc" 2>/dev/null; then
    echo '' >> "$HOME/.bashrc"
    echo '# PlotPilot Pure' >> "$HOME/.bashrc"
    echo 'alias plotpilot-pure="bash $HOME/plotpilot-pure"' >> "$HOME/.bashrc"
fi

echo ""
echo -e "${GREEN}${BOLD}✅ 安装完成！${NC}"
echo ""
echo -e "启动命令: ${CYAN}plotpilot-pure${NC}"
echo ""
echo "或手动运行:"
echo "  bash $HOME/plotpilot-pure"
echo ""
