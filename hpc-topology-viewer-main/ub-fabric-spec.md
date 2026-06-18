# UB Fabric · 32 卡卡间互联视图 — 实现规格

> 本文件描述 **已实现与下一轮优化目标** 的 UB Fabric 页面（`ub-fabric.html`）。
> 这是一个以多卡视图为主、叠加训练并行通信语义的独立页面，连线语义由 rank mesh 公式驱动。
> 项目根目录另有 `spec.md`（codex 的早期参考蓝本，只读），与本文件不是同一份。

## 1. 目标

用一个正交 3D 视角，展示 **4 台服务器 × 8 卡 = 32 卡** 的训练通信观察窗口，并把通信拆成两个层级：**card 层只表达节点内通信**，**node 方块层表达节点之间的 Fabric 可达性与 DP/PP 聚合通信**。卡用 clay（白模）风格，node 用实体方块，互联用语义色。

本页要回答三个问题：

- 这些 rank 为什么落在这 32 张卡上。
- 选中一张卡时，它在 TP / DP / PP / CP / EP 里的坐标是什么。
- 这张卡在当前并行策略下承担哪些模型计算切片与通信事件。

本页不直接证明真实物理线缆、光模块或交换机路径。物理 fabric 是另一层证据，需要独立拓扑数据支撑。

## 2. 技术栈

- React-Three-Fiber (`@react-three/fiber`) + drei + three，TypeScript，Vite 多页。
- 入口：`ub-fabric.html` → `src/ub-fabric-main.tsx` → `src/view/UbFabricView.tsx`。
- 相机：`OrthographicCamera` + `OrbitControls`；默认等距视角，支持按住拖拽旋转，平移和滚轮缩放关闭，缩放仍由页面滑杆控制。
- 设计系统：PTO tokens（`vendor/pto-design-system`）经 `src/ub-fabric.css` 引入。

## 3. 文件结构

| 文件 | 职责 |
|---|---|
| `ub-fabric.html` / `src/ub-fabric-main.tsx` | 页面入口与挂载 |
| `src/view/UbFabricView.tsx` | DOM 外壳：透明 toolbar（overlay/主题/info/settings）、Inspector rail、Legend、逻辑网格推导面板、单卡计算切片卡、渲染设置、状态管理 |
| `src/scene/UbFabricScene.tsx` | three 场景：卡、连线、EP 立方体、托盘、标签、相机、交互高亮 |
| `src/scene/ubFabricData.ts` | 数据层：rank mesh → 卡坐标 + card-layer TP 连线 + node-layer Fabric/DP/PP 聚合连线 |
| `src/ub-fabric.css` | 布局与主题（含 `.ubf-theme-light` 覆盖 PTO token） |
| `src/assets/ascend-logo.svg` | 卡封装顶面 silkscreen logo |

## 4. 布局（平铺）

- 每台服务器 8 卡平铺成 **2 列 × 4 行** 网格，同一 Y 平面（`BASE_Y=0.06`，列距 0.56、行距 0.42）。
- 卡 `t` → grid：`col = t % 2`，`row = floor(t / 2)`。
- 4 台服务器 2×2 摆放，中心 `x=±1.05 / z=±1.2`；每台外有矩形托盘描边，不显示贴地服务器文字标签。
- 卡 = clay 白模：底板 `0.42×0.04×0.30` + 封装块 `0.20×0.02×0.16`，完整描边；每张卡封装顶面都贴 Ascend logo。
- Node 层：每台服务器上方新增一个半透明方块，中心沿用服务器中心坐标，作为 `n0..n3` 的聚合通信端点。它参考主拓扑页的层级表达方式，把 node 从 card 层中分离出来，并抬高到 card 层上方避免遮挡。
- Node 方块与 card 托盘之间用淡虚线连接，表示“这些 card 属于这个 node”，不是物理线缆。
- Node 方块网格旁显示两个轴标签：`P axis · PP stage` 横向对应同 D 跨 P；`D axis · DP replica` 纵向对应同 P 跨 D。

## 5. 并行映射（rank mesh）

固定样例配置 **`dp=2 · pp=2 · cp=1 · tp=8`**（world = 32）。公式：

```
rank = ((d·pp + p)·cp + c)·tp + t
     = (d·2 + p)·8 + t        （cp=1, c=0）
```

服务器 → 坐标：

| 服务器 | (d, p) | rank 范围 |
|---|---|---|
| n0 | (0,0) | 0–7 |
| n1 | (0,1) | 8–15 |
| n2 | (1,0) | 16–23 |
| n3 | (1,1) | 24–31 |

一台服务器的 8 卡 = 一个 **TP 组**（本样例把 TP 组放在单节点内，以表达高带宽机内协同；是否一定对应某种真实物理 UB/HCCS 路径，需要物理拓扑数据另证）。

### 5.1 逻辑网格推导小图

页面需要新增一个小型说明图，放在画布左上或右上，标题为「rank mesh 推导」。它不是新的物理拓扑图，而是把配置推导过程显式化：

```text
parallel config
dp=2 / pp=2 / cp=1 / tp=8
        |
        v
grid[d][p][c][t]
rank = ((d * pp + p) * cp + c) * tp + t
        |
        v
2×2 节点窗口
n0 D0/P0 ranks 0-7     n1 D0/P1 ranks 8-15
n2 D1/P0 ranks 16-23   n3 D1/P1 ranks 24-31
```

选中一张卡时，小图高亮该 rank 对应的 `(d,p,c,t)`，并用一行公式解释。例如选中 `rank_11`：

```text
rank_11 = ((0 * 2 + 1) * 1 + 0) * 8 + 3
        = d0 / p1 / c0 / t3
```

这个小图的目的，是把白皮书里的「多维并行坐标」落成可见的 rank mesh 推导，而不是让用户从连线反推。

## 6. 连线语义

| kind | 颜色 | 连接 | 含义 | 画法 |
|---|---|---|---|---|
| **TP** | 青 `#38bdf8` | **card 层**：同 (d,p,c) 下 8 个 t 两两相连（28 条/组） | 张量并行组 all-reduce/all-gather；本样例把组放在机内 | **细线**（固定） |
| **Fabric** | 蓝 `#2563eb` | **node 层**：4 个 node 两两相连（6 条） | 节点间基础可达性/物理 fabric 的示意层 | **细线**（默认开启） |
| **DP** | 紫 `#a78bfa` | **node 层**：同 p 跨 d：n0↔n2 / n1↔n3，每条边聚合 8 个同 t rank lane | 数据并行梯度 all-reduce | **宽 band / 扁线** |
| **PP** | 绿 `#4ade80` | **node 层**：同 d 跨 p：n0↔n1 / n2↔n3，每条边聚合 8 个同 t rank lane | 流水线 stage send/recv | **宽 band / 扁线** |
| **EP** | 琥珀 `#fbbf24` | 当前实现为每台服务器顶部立方体；下一轮应细化到 rank/expert bucket badge | 专家并行专家桶与 MoE token dispatch/combine | 半透明立方体 + 虚线杆；后续改为 rank 级标签 |

**逻辑通信组要点**：
- Fabric 层画 4 个 node 的全连接可达性，所以有 6 条边。
- DP/PP 层只画训练通信组投影：每台服务器在本样例里有一个 DP 邻居和一个 PP 邻居。
- 对角线 n0↔n3 / n1↔n2（d、p 都不同）**无直接通信组**。
- DP/PP 的底层语义仍是 **逐 rank（同坐标位）**，但视觉上聚合到 node 方块层；页面不再画 8 条跨节点 card-to-card 线。
- Card 层只负责节点内通信，即本样例中的 TP 组；跨节点 DP/PP 不在 card 层落端点。
- 这些连线是「逻辑通信对象」而不是「真实线缆路径」。真实物理路径可能经过板内互连、交换芯片、网卡、交换机、光纤/光模块等，需要单独 overlay。

## 7. 视觉编码与交互

- **静止**：所有连线淡显；Fabric 最淡，DP/PP 更醒目；Fabric/DP/PP 穿过 node 方块上下居中的高度，并保留极小高度差避免 z-fight，同时不遮挡 node 顶面文字。
- **聚焦高亮**：hover 或点选一张卡 → 该卡的 TP card-layer 连线加粗提亮；该卡所属 node 的 Fabric/DP/PP node-layer 边同步提亮；hover 连线本体也会高亮（透明命中条）。
- **卡填充态**：hover→浅蓝、selected→蓝、同机 peer→更浅蓝；描边恒定（不靠描边表达状态）。
- **Node 方块态**：hover node 或选中该 node 内任意 card → node 方块描边/填充提亮且不透明；hover Fabric/DP/PP node edge → 两端 node 与其 card 集合提亮。
- **overlay 开关**（toolbar）：TP / Fabric / DP / PP / EP / Slice，独立开关；默认 TP+Fabric+DP+PP 开、EP 关、Slice 开。
- **info/settings 面板**：toolbar 背景透明；rank mesh 推导默认收起，由顶部 `i` icon 打开并可关闭；右侧 Inspector rail 默认收起，由顶部设置 icon 打开，右上角关闭。
- **主题**：Light / Dark，场景与 DOM 外壳同步切换。
- **Node 层连线样式**（渲染设置）：扁带 / 扁线，仅作用于 DP/PP；TP 恒为细线。
- **连线/轴 hover tip**：hover 任意 TP / Fabric / DP / PP 连线，或 D/P 轴文字时，画布底部显示解释卡，说明该线/轴属于哪个层级、连接哪些坐标、为什么 DP 是 same P cross D、PP 是 same D cross P。
- **逻辑网格推导小图**：常驻或可折叠的 DOM overlay，显示公式、2×2 D/P 节点窗口、当前选中 rank 的坐标推导。
- **单卡计算切片卡片**：Slice overlay 打开时显示，随 hover/selected card 联动；没有聚焦卡时显示提示。

## 8. Inspector 字段

聚焦卡显示真实身份（参考 knowledge.md §11.4）：

```
Global rank   rank_N
Device        910B_N
并行坐标       d· p· c· t
TP 组          D{d}·P{p} · 8 卡
Node 层        n{node} · Fabric + DP/PP 聚合边
DP 副本        DP{d}
PP stage      PP{p}
CP shard      CP0（本样例不切上下文）
TP shard      第 {t+1}/8 片
EP bucket     示例 experts E{rankBucketStart}-E{rankBucketEnd}
Compute slice PP stage 覆盖的 decoder blocks / TP shard / DP sample shard
```

### 8.1 单卡计算切片卡片

Slice layer 打开且聚焦某张卡时，画布中显示一个「单卡计算切片」卡片。它用于补足 3D 互联图不能表达的卡内计算语义：

```text
rank_11 / 910B_11
d0 / p1 / c0 / t3

PP1：Decoder blocks 31-60 + Final Norm / LM Head
TP3：Attention QKV / Out 与 FFN / MoE 投影的第 4/8 片
CP0：本样例未切上下文
DP0：处理本 step 的 DP0 mini-batch shard
EP11：示例 expert bucket E88-E95

Runtime events:
recv activation -> forward blocks -> MoE all-to-all -> send/recv -> backward -> DP all-reduce
```

注意：

- `p=0` 的 stage 可显示 Embedding；中间 stage 不显示 Embedding；最后 stage 可显示 Final Norm / LM Head。
- 本 32 卡样例只有 `pp=2`，所以 `p=0` 是前半段，`p=1` 是后半段。
- `EP bucket` 是产品解释层，必须标注为 derived example，不能说成 openPangu 官方真实 placement。

## 9. 渲染设置面板

滑杆：Zoom(48–340)、相机远近、画面上下(panY)、相机高度、主光亮度、环境亮度；可重置。按住拖拽可旋转正交视角。
默认：`zoom 300 / distance 1 / height 6.5 / panY 0 / keyLight 0.9 / fillLight 1.65`。
panY 同时移动相机与 OrbitControls target；滚轮缩放和平移关闭。

## 10. 准确性边界与当前校验结论

- 本图表达的是**逻辑通信组**（TP/DP/PP）和一个 schematic 的 node Fabric 可达性层，不证明真实交换机、线缆、光模块路径。精确物理 fabric 仍需要独立拓扑数据。
- 当前 HTML/实现和本 spec 的 rank mesh 主体匹配：`dp=2 / pp=2 / cp=1 / tp=8`、4 个 D/P 节点、每节点 8 个 TP slot。
- 当前 Fabric 层是 4 node 全连接示意；当前训练互联关系在「逻辑通信组」层面是正确的：TP 是同 `(d,p,c)` 组，并画在 card 层；DP 是同 `(p,c,t)` 跨 `d`，PP 是同 `(d,c,t)` 跨 `p`，并聚合画在 node 层。
- 当前 DP/PP node edge 是 8 个同 t rank lane 的聚合表达，不是单条物理链路。
- 当前互联关系不能被表述为真实物理直连拓扑：例如 n0↔n2 被画成 DP 逻辑邻居，不代表两台服务器之间一定有一根直连线。
- `dp2·pp2·tp8` 是便于演示的**缩样配置**。盘古训练示例应写为产品派生 placement：`TP=8 × PP=16 × CP=1 × DP=32`、`EP=32`，总规模约 4096 卡；精确 openPangu 官方训练 placement 未公开。
- EP 现以"每服务器一个立方体"简化表达；按 knowledge.md，EP 应作为独立 placement 单独建模，后续可细化。
- 不应表述为"这张卡负责第几层"：每个 rank 在 PP/TP/DP/CP/EP 上各有坐标。

## 11. 优化执行计划

### 11.1 第一阶段：修正说明与可解释 overlay

- 更新本 spec 的准确性边界，避免把逻辑通信组误写成物理拓扑。
- 新增 `Slice` overlay 开关，默认开启。
- 新增逻辑网格推导小图，展示 `dp×pp×cp×tp`、rank 公式、2×2 D/P 节点窗口、当前选中 rank 的坐标。
- 新增单卡计算切片卡片，随 hover/selected card 联动；无聚焦卡时显示引导。
- Inspector 增补 CP、TP、EP、PP blocks、DP sample shard 字段。
- 已将跨节点 DP/PP 从 card-to-card 端点上移为 node-to-node 聚合边，card 层只保留 TP 机内通信。
- 已新增 Fabric overlay：4 个 node 的全连接可达性用 6 条细线表达，与 DP/PP 逻辑通信组分开。
- 已新增 D/P 轴标签与连线 hover tip，用于解释 DP/PP 在 rank mesh 中的正交关系。

### 11.2 第二阶段：EP 与真实盘古窗口

- 将 EP 从服务器级立方体细化为 rank 级 expert bucket badge。
- 用 `PANGU_SAMPLE` 常量记录 `decoderBlocks=61`、`routedExperts=256`、`tp=8` 等公开/派生字段。
- 对 `p=0`、中间 stage、末尾 stage 使用不同卡内计算描述，避免把非 Stage0 rank 画成 Embedding。
- 把 `EP bucket` 标记为 `derived`，并保留证据说明：公开模型 config 能证明专家数，不能证明官方真实 placement。

### 11.3 第三阶段：精确物理 fabric 证据层

- 将当前 schematic Fabric overlay 升级为精确物理路径前，必须先定义 `physicalTopology` 数据结构：host、device、board fabric、NIC/switch、link medium。
- 不把 HCCS/UB/RoCE/光模块混在同一连线样式里；必须拆成硬件层、协议/通信库层、训练语义层。
- 只有拿到可靠拓扑数据后，才能在页面中显示真实物理路径或光模块级链路。

## 12. 参考

- 并行/术语权威说明：`/Users/yin/pto/pangu-moe-trainviz/knowledge.md`
- 盘古产品需求与证据边界：`/Users/yin/pto/pangu-moe-trainviz/PRD-训练透视.md`
- 模型 config：openPangu-Ultra-MoE-718B
- rank mesh / placement 逻辑：`ParallelDemo`
