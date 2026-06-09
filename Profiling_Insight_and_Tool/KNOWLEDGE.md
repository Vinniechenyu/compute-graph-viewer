# 950data 项目知识结构

> 整理目的：将本目录下的 24 份 PDF 技术文档（昇腾 950 / CANN 技术峰会资料）与 3 份 Gitcode issue 导出 CSV，组织成可被后续问答快速检索的结构化知识地图。每一条知识点都标注了来源文件，便于回溯。
>
> 文档来源约对应 2026 年 5 月 CANN 技术峰会（"CANN Session"，2026-05-23）相关材料；issue 导出快照时间为 2026-05-28。

---

## 1. 目录结构

```
d:/Projects/950data/
├── 950others/      # 19 份 PDF：昇腾 950 架构、CANN 框架、Ascend C / PyPTO 编程、大模型实践
├── profiling/      # 5  份 PDF：性能调优、算子优化案例、TileLang、TorchTitan-NPU
├── issue/          # 3  份 CSV：Gitcode 上 cann/pypto、cann/asc-devkit、Ascend/msinsight 三个仓的 issue 导出
└── _extracted/     # 24 份 PDF 用 pdftotext 提取的纯文本，便于检索（自建）
```

---

## 2. 一级主题地图

```
昇腾 950 技术栈
├─ 硬件 (§3)         ── Chiplet、AI/Vector Core、内存层级、互联拓扑、SuperPOD
├─ 软件栈 CANN (§4)  ── 编译器、运行时、社区治理 (TSC/PMC/SIG)
├─ 算子编程 (§5)     ── AsNumpy / PyPTO / Triton-Ascend / TileLang / Ascend C
├─ 数据精度 (§6)     ── FP16/BF16/FP32/HF32 + FP8(E4M3/E5M2) + HiF8 + MXFP4/8
├─ 大模型实践 (§7)   ── DeepSeek-V4、LongCat-Flash、OSP-Next 文生视频
├─ 性能调优 (§8)     ── msProf / MindStudio Insight / mssanitizer / Roofline
├─ 优化案例 (§9)     ── MXFP4 Matmul / RMSNorm / Flash Attention / Top-K
└─ Issue 仓库 (§10)  ── pypto (1944) / asc-devkit (733) / msinsight (295)
```

---

## 3. 昇腾 950 硬件架构

### 3.1 芯片设计（来源：昇腾950特性全景剖析、PTO ISA教你如何快速上手昇腾950）

- **Chiplet 设计**：2 颗 Compute Die + 多颗 IO Die，针对 LLM-Prefill / LLM-Decode 差异化优化。
- **Compute Die**：每颗含 16 个 AI Core，含 L3 缓存、DMA、DVPP、CPU 等模块。
- **整片规格（PTO ISA 文档）**：32 个 Cube × 64 个 Vector @ 1.65 GHz；DDR 128 GB / 1.6 TB/s；IO 2016 GB/s；TDP 630 W。
- **峰值算力**：FP32 27 TFLOPS（单 core）/ FP16 432 TFLOPS / FP8/FP6 864 TFLOPS / FP4 1728 TFLOPS。
- **互联**：跨 Die 通过 UB Switch（36 Lane、9 Port）+ IO Die CCU；Server 级 8 NPU + 2 CPU 7×X4 UB Fullmesh；POD 64+16 NPU/CPU，Fullmesh+Clos；SuperPOD 1024P 8 层 L1/L2 Clos。
- **协议**：PCIE 5.0、RoCE、UBoE、IOUB；LD/STURMA、NDDMA。

### 3.2 计算单元

| 单元 | 关键特性 |
|------|----------|
| **Cube** | L0A 64KB + L0B 64KB + L0C 256KB；256 B/cycle MMAD；支持 FP16/FP8/FP4/MXFP8 |
| **Vector (AIV)** | 4 个 Warp Scheduler；SIMT Register File 128 K；数据缓存 32 K；UB（统一缓存）256 KB；64 lane SIMD，VL=256 B |
| **Scalar** | 32-bit GPR，控制流与基础计算 |
| **CCU** | Collective Communication Unit，跨节点 AllGather 等集合通信 |

### 3.3 内存层级

`GM → L3(DDR远端) → L2(512KB) → L1 → L0A/L0B(64KB)/L0C(256KB) → UB/Reg`

- L0C↔UB 直通：相比 910 减少 GM 中转。
- 128 B Sector-cache、NDDMA。
- 支持 ND / NZ 数据格式与 Nd2Nz/Dn2Nz 转换。

### 3.4 新引入硬件特性

- **HiBL 1.0/2.0**、**HiZQ 2.0**（量化引擎）。
- **DualDest**：L0C 输出可二分割（M/2 或 N/2）发到 AIV0/AIV1。
- **Gather-V2 / InsertHash**：非连续内存访问与动态哈希表。
- **CV Mix**：Cube-Vector 混合执行，支持 1:2 流水线比例。

---

## 4. CANN 软件栈与社区

来源：CANN Session致辞、面向新一代硬件，CANN技术架构的变与不变

### 4.1 版本路线图

- 当前：CANN **1.6.0**（2026-05 发布；Toolkit 下载 ~4 GB）。
- 主要里程碑：**25.10 → 25.12 → 26.03**，逐步完善 PyPTO、Ascend C、Triton/TileLang/FlagTree 等编程能力。
- 多代芯片：A2/A3、910B/910C、**950**（重点），A5（下一代规划）。
- 算子：内置算子 700+，高阶库 200+。

### 4.2 社区治理

- **TSC**（技术决策）→ **PMC**（项目管理）→ **6 个 SIG**（ops-basic / ops-nn / QA / security 等）。
- 30+ 仓库（ascendc / blas / catlass / recipes / mat-chem-sim-pred 等）。
- 200+ 贡献者；99% PR 通过率，40% 自动化检测，15% 安全扫描。
- 月度 Meetup、专家论坛、AtomGit 镜像。
- 主入口：[gitcode.com/cann](https://gitcode.com/cann)、[hiascend.com/cann](https://www.hiascend.com/cann)。

### 4.3 框架架构"变与不变"

来源：面向新一代硬件，CANN技术架构的变与不变

- 不变：CANN 整体分层（驱动 / 运行时 / 编译器 / 算子库 / 框架接入）。
- 变：
  - 950 新增 Vector 引擎需要 Cube+Vector **混合编程**。
  - 引入 PyPTO 作为 Python DSL；Ascend C 拆为 Tensor / C / ISA 三层 API。
  - Triton-Ascend 与 TileLang 作为 GPU 风格 DSL 落地。
  - 跨 AIC/AIV 同步原语（CrossCoreSetFlag / WaitFlag、L0C↔UB 传输）。
  - 95% Ascend C API 向前兼容 A2/A3。

### 4.4 950 硬件新架构要点（来源：面向新一代硬件，CANN技术架构的变与不变）

**两种形态**：
- **950PR**：中等算力/带宽，低成本，适合大规模部署
- **950DT**：高算力/带宽，中等成本，适合高强度训练

**AI Core 主要改动点**（相比 910B/910C）：
- 矩阵单元升级：支持 FP8/MXFP8/HiF8/MXFP4；支持 Cube-Vector 融合通路；Vector 算力提升
- 新增 SIMD/SIMT 双范式；Regbase 架构（GM↔UB↔Reg）
- 新增数据通路：UB→L1（UB2L1）、L0C→UB（L0C2UB）；废除 L1→GM 路径
- 新增 SSBuf：支持 C/V 之间的消息通路

**Chiplet 演进**：从 2 Die（单代）升级到 4 Die（2×Compute Die + 2×IO Die）。CCU 位于 IO-Die 内。

**CCU（专用通信引擎）**：
- 降低内存带宽占用、降低通信时延、天然零拷贝及确定性计算
- 利用片上 Buffer 缓存通信数据，减少片存带宽需求
- 专用通信调度与同步机制，不占用计算算力

**超节点/灵衡互联**：
- 128 NPU / 16 台 Server → **128P 超节点**
- 1024 NPU / 128 台 Server → **1024P 超节点**（POD 间使用单层 SW 组网）
- 灵衡互联特征（UB 协议）：对等架构（打通以 CPU 为中心的模式）、统一协议（支持协议双发）、高性能大规模、全局内存语义

---

## 5. 算子编程框架矩阵

来源：场景驱动下的算子编程语言选型、PyPTO 系列、Ascend C 系列、TileLang 系列

### 5.1 框架对比

| 框架 | 抽象级别 | 主要语言 | 性能上限 | 易用性 | 典型场景 |
|------|----------|---------|---------|--------|----------|
| **AsNumpy / PyAsc** | NumPy 风格 | Python | 低 | 极高 | 快速验证、AI 框架集成 |
| **PyPTO** | Tensor/Tile | Python | 中-高 | 高 | 融合算子原型、动态 Shape |
| **Triton-Ascend** | Tile (GPU 风格) | Python | 中-高 | 中 | SIMT/SIMD 混合学术研究 |
| **TileLang** | Tile (TVM 风格) | Python DSL | 高 | 中 | Flash Attention 等典型算子 |
| **Ascend C** | Kernel | C++ | 极高 | 低 | 极致性能、商业产品 |
| **PTO ISA** | 指令 | ASC/汇编 | 极致 | 极低 | 底层调优、ISA 研究 |

### 5.2 PyPTO 快速参考

来源：PyPTO Hello, World / Tensor 编程范式 / 模型融合算子实操 / IDE 调优工具实操

- **全称**：Python Parallel Tensor/Tile Operation。
- **依赖**：Python ≥ 3.9、PyTorch + Ascend Extension、Ascend HDK 25.2/25.3、cmake ≥ 3.16、g++ ≥ 7.3、Modern C++ JSON 3.11、libboundscheck 1.1.16。
- **入口**：`@pypto.jit` 装饰器；执行 `python3 hello_world.py --run_mode={npu|sim}`。
- **调试**：`pypto.set_debug_options({"runtime_debug_mode": 1})` 输出 `merged_swimlane.json` 至 `output/`。
- **核心 API**：`pypto.amax/exp/sum/matmul/sigmoid/cast/reshape/transpose`；视图 `pypto.view/assemble/concat`。
- **控制流**：`pypto.loop(start, count, step, name)` / `pypto.cond(...)` / `pypto.loop_unroll([64,16,4])`。
- **动态 Shape**：`pypto.symbolic_scalar(64)`。
- **互操作**：`pypto.from_torch(tensor, "INPUT")`。

**Tile 切分规则**：
- Cube：`pypto.set_cube_tile_shapes([[512,128],[128,128],[64,256],[256,256]])` — Prefill 场景 Q-linear 推荐 [512,128]；Decode 场景通常带宽 bound，可 loop_unroll 展开
- Vector：`pypto.set_vec_tile_shapes(64, 512)` — 不宜过大（RoPE 设为 96KB(FP32) 会 OOM，缩小到 64KB 避免）
- K-linear 与 Q-linear tile shape 不同，需分场景调整

**模型融合算子开发 3 步流程**：
1. 阅读模型脚本，梳理计算流，绘制计算流程图，确定算子原型（输入/属性/输出）
2. 按模块逐一开发（Layernorm / RoPE / Quant / Matmul），用 PyTorch golden 比对精度
3. 将模块组装，用 PyPTO Toolkit 分析泳道图，定位性能瓶颈，逐层调优

**量化算法实现示例（FP8 / HiF8 Per-Token）**：
```python
# FP8（E4M3，max=448.0）
def fp8e4m3_quant(x):
    fp8_max_value = 448.0
    abs_res = pypto.abs(input_fp32)
    max_value = pypto.amax(abs_res, dim=-1, keepdim=True)
    temp448 = pypto.full(max_value.shape, fp8_max_value, pypto.DT_FP32)
    scale_quant = temp448 / max_value
    out_fp8 = pypto.cast(input_fp32 * scale_quant, pypto.DT_FP8E4M3)
    return out_fp8, scale_quant

# HiFloat8（max=32768.0）
def hifloat8_quant(x):
    hif8_max_value = 32768.0  # HiF8 比 FP8 大得多
    # 结构相同，只换最大值与输出类型 pypto.DT_HF8
```

**性能调优基本步骤**：
- 优先调：动静分与 Stitch（静态图合并是最大杠杆）→ Cube & Vector 各模块独立分析 → 其他
- Cube 进阶：L1Reuse（HadamardTransform 等左矩阵固定大小 [128,128] 常驻 L1，避免重复搬运）；CubeNBuffer（减少冗余内存及任务）
- Vector 进阶：TileShape 不宜过大（RoPE 96KB OOM）；连续 Vector 操作尽量使用相同 TileShape 促进图合并

**AI Agent 自主调优路线图**：
- 2026Q1：小型融合算子自动生成 + 社区资料补充
- 2026Q2：中等复杂度算子自动生成 + 支持性能迭代调优 + 主流生态兼容
- 2026H2：复杂融合算子 + 基于深度性能优化 + 支持 aicpu 调优 + 扩充 Agent Skills

**PyPTO Toolkit（VSCode 插件，4 大核心特性）**：
1. **控制流可视化**：通过逻辑映射验证算法意图（代码←→算法一致性）
   - 计算逻辑可视化 / 代码视图 / 控制流图结构 / 映射关系视图 / 节点搜索详情
2. **计算图可视化**：全景解析计算逻辑，表达 Tensor/Operation 等计算图信息
3. **泳道图可视化**：揭示核间核内微观执行信息，揭示性能瓶颈
   - 核间流水可视化 / 核内执行时序分析 / 量测节点时间间隔 / 性能报告 / 设置时间观测线 / 搜索泳道图节点
4. **三栏联动**：代码-计算图-泳道图一站式闭环调优（快速定位瓶颈到代码行）

**典型实现**：DeepSeek-V3.2 IndexerProlog 融合算子（Cube: Q_b_proj + LayerNorm + Dequant + RoPE + Hadamard + Quant → scatter；Vec: RoPE + act_quant + norm + MulS；含 FP8 E4M3 vs HiF8 精度选择）。

### 5.3 Ascend C 编程模型

来源：基于下一代Ascend平台的Ascend C算子编程概述、Ascend C 编译与调试调优、Reg矢量、SIMD/SIMT混合、Cube 编程、SIMT 编程介绍

#### 5.3.1 API 三层

1. **Tensor API**（`LocalTensor` / `RegTensor<T>` / `Layout`）：高层，自动布局优化。
2. **C API**：SIMD/SIMT 通用基础 API（Load/Store/Add/Mul/...）。
3. **ISA / RegAPI**：极低延迟，逼近硬件。

#### 5.3.2 SIMT 模型

来源：基于下一代Ascend平台的SIMT编程介绍（全读）

**启动语法**：
- SIMD/SIMT 混合：`mix_kernel<<<numBlocks, dynUBufSize, stream>>>(args...)`
- VF 函数声明：`__simd_vf__ __launch_bounds__(maxThreadsPerBlock) inline void VFFunction()`
- 调用 VF：`asc_vf_call<VFFunction>(...args...)`

**线程层级**：Grid(gridDim) → ThreadBlock(blockDim ≤ 2048) → Warp(32线程) → Thread
- 每个 AIV 只运行一个 Thread Block
- scheduler_id = warp_id % 4（每个 AIV 4个 Warp Scheduler）

**UB 内存分配**（DataCache = UB大小256K - 静态 - 动态 - 预留8K，必须≥32K）：
- 静态内存：`__ubuf__ half staticBuf[1024]`（固定大小）
- 动态内存：`<<<dynUBufSize>>>` 参数指定，`extern __ubuf__ half dynamicBuf[]` 使用
- 预留空间：8KB（编译器和 ASC 预留）
- Data Cache：用于 SIMT 访问 GM 时的 Cache，必须≥32K

**SIMT API 分类**：
- Math：`simt_asc_math_functions.h`（floorf/ceilf/sqrtf/expf 等标准数学函数）
- Warp Vote：`asc_all/asc_any/asc_ballot(predicate)`
- Warp Shuffle：`asc_shfl/asc_shfl_up/asc_shfl_down/asc_shfl_xor(val, delta/mask)`
- Warp Reduce：`asc_reduce_add/max/min(val)`
- 原子操作：`asc_atomic_add/asc_atomicCAS/asc_atomic_exch(address, val)`
- 线程同步：`asc_syncthreads()` / 内存屏障：`asc_threadfence()` / `asc_threadfence_block()`

**SIMT 5 大优化技巧**：
1. **合理切分**：线程数 512~1024 最佳（不超 2048），优先保证计算结果可达；b32 类型优先（b64 占两寄存器，消耗翻倍）
2. **访存合并**：同 Warp 内线程访问全局内存请求落在同一 Sector 时合并为单次请求，带宽利用率最高
3. **避免 Warp Divergence**：SIMT 硬件为每个 Warp 分配单个 PC，分支跳转导致分支串行执行；分支应在 Warp 间（按 warp_id 分支），而非 Warp 内（按 thread_id 分支）
4. **代码优化（利于编译器）**：将独立的 Load/Processing/Store 操作分组放一起（多组 LOAD+PROC+STORE 顺序 → 先批量 LOAD 再批量 PROC 再批量 STORE），有利于编译器优化代码并发
5. **`#pragma unroll`**：提示编译器展开循环（优点：减少分支判断+提高指令级并行；缺点：代码膨胀+寄存器消耗增加）

**参数量控制**：SIMT 入参用寄存器存储，最大 28×32 Bit；超过此大小使用预留空间中转传递（延迟变大）。建议将较大的 tiling 参数结构体搬入 UB（函数体内展开）。

#### 5.3.3 SIMD / Reg 矢量编程模型

来源：基于下一代硬件的Ascend C Reg矢量编程（p1-11）

**Regbase 硬件架构**：
- SIMD Vector 新增 Reg 内存层级，数据流变为 GM↔UB↔Reg（而非原 GM↔UB）
- VF（Vector Function）是计算单元粒度；每个 VF 在独立 SIMD Vector 计算单元内执行
- VL（Vector Length）= 256 Bytes = 单个 SIMD Reg 寄存器长度

**编程数据流（5步）**：
1. Reg 矢量计算必须在 SIMD VF 内实现，使用 `__simd_vf__` 修饰
2. 先在 Kernel 函数中将 GM 数据搬运到 UB，将 UB 地址作为参数传给 SIMD VF 函数
3. 然后在 SIMD VF 中，从 UB 读取数据到 Reg，完成计算后将 Reg 数据写回 UB
4. 最后在 Kernel 将计算结果从 UB 搬回 GM
5. Kernel 函数通过 `asc_vf_call<VFFunction>()` 调用 VF

**API 分层**：
```
C++ 设备类库: Ascend C 基础 API
  ├── 内存 Membase 矢量计算（兼容当代算子）
  └── Reg 矢量计算（新增）RegTensor<T>
C/C++ 语言扩展层: Ascend C 语言扩展 C API
  ├── Membase 矢量计算（兼容）
  └── Reg 矢量计算（新增）vector_float / vector_bfloat16_t
```

**函数修饰与调用规则**：
- `__simd_vf__`：VF 函数标识，必须通过 `asc_vf_call<func>()` 调用
- `__simd_callee__`：只能在 VF 内部调用的函数，其标量计算在 AuxScalar 执行
- 向量类型（C API）：`vector_float / vector_bfloat16_t / vector_int8_t / vector_bool`，VL=256 B
- C++ 模板：`AscendC::Reg::RegTensor<T>` 定义 SIMD Reg 寄存器

**Load/Store 接口**：`asc_load/store`、`asc_load_align/asc_store_align`、`asc_loadunalign_pre/post`、`*_postupdate`（自动更新指针偏移）。
**内存屏障**：`asc_mem_bar(VV_ALL | VST_VLD | VLD_VST | ST_LD)`。
**Hardware Loop**：用 `uint16_t` 计数走硬件路径（性能更优）。

#### 5.3.4 SIMD/SIMT 混合编程

- 单 kernel 可同时调用 SIMD VF 和 SIMT VF；主 kernel 走 SPMD（block_idx + thread_idx）。
- 典型组合：Cube Matmul + Vector LeakyReLU；ScatterAdd / Gather 中 SIMT 做索引并行、SIMD 做规约。

#### 5.3.5 A2/A3 → 950 迁移：约 95% 兼容，5 大不兼容项

来源：基于下一代Ascend平台的Ascend C算子编程概述（p38-41）

**约 95% API 兼容**：修改 CMake 架构版本号（`-DCOMPILE_LANGUAGE.ASC=npu-arch-dav-3510`），重新编译即可。

**5 大不兼容项（需手动修改）**：

| 硬件单元 | 变化 | 影响接口 | 迁移方案 |
|---------|------|---------|---------|
| 搬运单元 | 删除 L1Buffer→GM 的数据通路 | `DataCopy/DumpTensor` | 1. cube only 场景：通过 MIX 类型用 Vector 搬运；2. mix 场景：通过 L1→UB→GM 替代 |
| 搬运单元 | 删除 GM→L0A Buffer→L0B Buffer 的数据通路 | `InitConstValue/LoadData` | 通过 `LoadData` Pipeline 先将数据搬到 L1 再到 L0 |
| 计算单元 | Cube 计算不支持 int4b_t 类型 | `LoadData/LoadDataWithTranspose/Mmad` | 算子通过 MIX 使用 Vector Core 实现 |
| 计算单元 | L0A 形状变化 ZZ→ZN | `LoadDataWithTranspose/Mmad` | 1. L0A 切分数量乘以 2 个 L0A Buffer 大小；2. Stride 保持不变 |
| 计算单元 | Cube only 不支持单个 MMAD 语义 | `matmul_mx(a, sa, b, sb, c)` 等 | 通过 mix 类型，使用 MIX Core 执行 |

**兼容案例 1**：修改 CMake 中架构版本号，即可直接重新编译运行。

**兼容案例 2**（非兼容接口修改）：原用 int4b_t 类型 → 改为 int8_t + 手动转换：
```cpp
// 原 Ascend C A2/A3
AscendC::Cast(int4b_t, tmpTensor, int8_t, srcLocalTensor, CAST_CEIL, count*2)
// 迁移到 950
AscendC::Cast(out_half, int4b_t+int8_t→处理)
AscendC::RoundMode::Cast_ceil(out_int8, out_int8, count*2)
// 或等价地用 Mmad 的输出取半精度后转换
```

#### 5.3.6 Cube 编程关键 API

- 流程：`Init` → `CopyIn(Nd2NzParams)` → `LoadData2D(SplitA/B)` → `Mmad/matmul_mx` → `Fixpipe(C310, dualDstCtl)`。
- 跨核同步：`CrossCoreSetFlag/CrossCoreWaitFlag`，4 种 SYNC_MODE。
- MXFP8：`matmul_mx(a, scale_a, b, scale_b, acc)`，32:1 缩放比，scale dtype `e8m0`。
- Flash Attention（FAG）三阶段：QK→Softmax→PV，结合 L0C 双向输出。

### 5.4 PTO ISA 抽象指令

来源：PTO ISA教你如何快速上手昇腾950（p17-28 全覆盖）

#### 5.4.1 内存层次延迟（"仓库天数"比喻）

| 存储层级 | 比喻 | 延迟 |
|---------|------|------|
| 寄存器 | 1天 | ~1ns |
| L1 (数据仓库) | 4天 | |
| L2 | 10天 | |
| L3 | 20天 | |
| 其他城市 L3 (RDMA 远端) | 50天 → 8年 | ~1μs |
| DDR | 300天 | ~100ns |
| RDMA | 8年 | ~1μs |
| RPC | 3-30世纪 | 10-100μs |

SDR/DDR/QDR：1/2/4 signals per clock cycle。

**核心设计原则**：距离越远，操作的数据块越大
- Scalar Operation：32 bit（寄存器）
- Tile Operation：8KB-16KB（DDR 方向）

#### 5.4.2 指令分类（三类）

| 类别 | 代表指令 | 作用 |
|------|---------|------|
| 标量 | `pload/pmemref`, `pmul`, `pstore` | 32-bit 寄存器运算 |
| 向量 | `pvload/pvmemref`, `pvmul`, `pvstore` | VReg 向量运算 |
| 张量/块 | `pto.tload`, `pto.textract`, `pto.matmul`, `pto.tstore` | Tile 级矩阵运算 |

#### 5.4.3 PTO Abstract Machine 架构

```
Scalar × 2    CUBE    VECTOR
              ↕
   Tile Register (Left|Right|ACC|Scale|Bias|Vec|Rdc)
              ↕
      TLOAD          TSTORE
              ↕
         Global Memory (Tensor)
```

**关键指令语义**：
- `pto.tload`：从 GM 加载到 Mat Tile (L1 Buffer)
- `pto.textract`：从 L1 输出更小的块到 Left-L0A / Right-L0B
- `pto.matmul`：从 L0A, L0B 做矩阵乘，写到 ACC-L0C
- `pto.matmul_acc`：从 L0A, L0B 做矩阵乘，累加到 ACC-L0C
- `pto.tstore`：从 L0C 写回 GM

#### 5.4.4 内存层次与指令数据量对应

| 指令 | 数据量 | 对应层级 |
|------|-------|---------|
| `pto.vload` | 256 B | 寄存器级 |
| `pto.textract` | 8 KB | L1 |
| `pto.tload` | 64 KB | L2 |
| `pto.tget` | 512 KB | L3 |

#### 5.4.5 控制流

- **静态循环**：Python 控制流 → 直接翻译成机器指令（编译期确定）
- **动态循环**：`for i in pto.range()` → 启动 JIT 计算

#### 5.4.6 MXFP8 支持（A5 新格式）

```python
scale_k = mx.scale_k(K)   # e5m2，32:1 压缩比
a_tile = pto.left_tile_tensor(shape=[M,K], dtype=e5m2)
scale_a_tile = pto.left_scale_tile(shape=[scale_k, N], dtype=e8m0)
# 核心调用
pto.matmul_mx(ta, tsa, tb, tsb, tc)
```

- Roofline + Double Buffering + Swizzle Layout 是主要优化手段。

### 5.5 TileLang

来源：TileLang典型算子性能优化（全读）、场景驱动下的算子编程语言选型

- Python DSL + TVM 后端，定位为"Expert+Developer"双向；国内主导项目。
- 关键原语：`T.Kernel / T.Pipelined(num_stages, cross_interval)`、`copy/gemm/add`、`Fixed Core` 模式。
- AIC（Cube）+ AIV（Vector）协作：MTE2→VEC→MTE3 流水。

**双模式**：
- **Developer 模式**：标准 gemm 原语，通过数据类型扩展支持低 bit 计算；代码简洁（`T.gemm`, `T.vec_add`）。
- **Expert 模式**：扩展 API 实现硬件能力（数据搬运、低 bit 计算），可直接调用硬件指令。

**Parallel 原语 + SIMT 组合**：
- `T.Parallel()` 实现多线程并行处理条件分支和离散操作；后端直接对接 PTO ISA，VF 融合

**Triton-Ascend CV 融合支持**：
- `AutoCV Pipelining`：CV 执行序列最大化利用硬件资源；`AutoSubTiling`：Vector 切分 `CV1:1 / CV1:2`

**Cube核内性能优化关键策略**：
- **L1内存常驻**：gemm分多块，块间Q矩阵常驻L1，减少访存（适用于 Q@K 场景）
- **splitK**：单次 gemm 内部切分 K 维，实现核内数据块间 overlap
- 三级流水：GM→L1/L0C→GM（核间）/ L1→L0（核内）/ 全路径

**`T.Pipelined` 参数调优规律**：
- `num_stages=2`：有气泡（vector→cube C存在gap）
- `num_stages=3`：气泡减少，并行效果更好
- `cross_interval=1`：单次任务同步，核间同步开销大（调度在wait到flag前已产生气泡）
- `cross_interval=2`：两次任务同步，减少同步开销，但并行度变差
- **实践**：尝试不同组合，FA最终最优 `num_stages=8, cross_interval=2`

**不支持 Nested Pipeline（嵌套管线）**：不可同时开启核内和核间 pipeline

**FA 算子渐进优化（vs Ascend C）**：
- 36%（基线）→ 47%（L0 Double Buffer，Cube gemm同步化）
- → 55%（Vector Double Buffer，MTE2+VEC+MTE3三流水并行）
- → 63%（axpy指令替代多条计算，`getValue+subs → tils.sub`，多scalar→一次tile）
- → 80%（`num_stages=8, cross_interval=2`，Expert模式）

**SFA（Sparse FlashAttention）优化（达到 Ascend C 手写算子的 90%）**：

- 目标：IO感知精确注意力 + 稀疏注意力结合，O(L²)→O(L log L)
- 典型 shape（act_kv_size=2560）从 Ascend C 13% 到 90.8%：

| 文件 | Fixed Core | kv大 | 异步搬进 | Ping-Pong | CV | Broadcast | AXPY | 聚集 | 性能 |
|-----|:---------:|:----:|:-------:|:--------:|:--:|:---------:|:----:|:----:|:---:|
| baseline | ✓ | 64 | | | | | | | 16.4% |
| developer | ✓ | 64 | ✓ | ✓ | ✓ | ✓ | | | 28.2% |
| cv | ✓ | 64 | ✓ | ✓ | ✓ | ✓ | ✓ | | 77.2% |
| ro_cv_pipeline | ✓ | 256 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **90.8%** |

四大优化技术：
1. **Cube SplitK+Pipeline**：Q@K 按 K=576/64=9块，P@V 按 n_base_size 64→256，Ping-Pong 使 MTE1 搬运与 Cube 计算重叠
2. **Vector负载均衡**：Cube:Vector=1:2特性，双Vector核分别处理；Gather+连续输出避免GM稀疏读
3. **算法优化**：`axpy(-max, m, sm_scale)` 替代两条指令；`broadcast→vec` 多scalar→一次tile操作
4. **异步同步**：手动 `set_flag/wait_flag` 精细控制，避免自动同步开销

**优化总原则**：拉平短板流水（短流水填入长流水空隙）、减少气泡、趋向单一 Bound

- 仓库：`tile-ai/tilelang-ascend`

### 5.6 PyPTO 新增低比特与融合能力

来源：场景驱动下的算子编程语言选型（p13,p21,p28,p35）

**PyPTO 架构栈**：
```
IDE  →  PyPTO Frontend (Python DSL: Tensor/Block)  →  PyPTO Framework
     →  TensorGraph/TileGraph/BlockGraph  →  PyPTO Passes  →  PyPTO Codegen
     →  PTO-ISA  →  BiSheng 编译器  →  MPMD Runtime (AICPU/VECTOR/CUBE CORE)
```

**低比特矩阵计算 `scaled_mm`**：
```python
# 函数签名
scaled_mm(mat_a, mat_b, out_dtype, scale_a, scale_b,
          *, a_trans=False, c_matrix_nz=False, c_extend_params=None) -> Tensor
# 示例
out = pyto.scaled_mm(a1, b1, pyto.DT_BF16, scale_a, scale_b)
```
- 支持 MXFP8/MXFP4 数据类型；mat_a/b 为矩阵，scale_a/b 为量化参数

**Mix 子图切分（下一代硬件数据通路）**：
- 将 Cube 子图与 Vector 子图合并为 Mix 子图
- 新数据通路：L0C2UB、UB2L1（950 新增直连）
- 使用核间同步替代任务下发，减少任务调度器负担

**快速算法验证场景（PyPTO 尤其适合）**：
- 通过 Tensor 层级抽象，算法工程师专注逻辑表达，无需关注硬件细节
- 内部自动处理：流水同步、内存申请复用、MXFP8 精度、VF 融合、mix 归并
- 适用：数据计算流程理解、模块调用组合、融合算子原型开发

### 5.7 Ascend C 950 新增特性

来源：场景驱动下的算子编程语言选型（p11,p19,p20,p25,p27）

#### 5.7.1 新增 SIMD Reg 矢量 API

- 语言扩展 C API 引入 Reg 矢量 API；基础 API 引入矢量 API
- `Template<typename T>` 模版化 RegTensor 计算；使用 `AscendC::Reg::RegTensor<T>` 类型

#### 5.7.2 MX FP4/FP8/HiF8 低比特矩阵计算

公式：`C = (ScaleA ⊗ A) = (ScaleB ⊗ B) + C`（含放缩功能矩阵乘）

**关键接口**：
- `DataCopy`：Scale&A 使用 Nd2Nz/Dm2Nz 格式，接口无特殊处理
- `LoadData2DMX`：ScaleA/ScaleB 通过此接口载入
- `Mmad`：MX格式自动对应数据类型 `matmul_mx` 行为，参数无变化
- `FixPipe`：Scale 不涉及 FixPipe 输出

**4步骤实现**：
1. 初始化 DataCopy（Scale 使用 L1 Buffer，行数为 n/2n）
2. Scale 初始化（Scale 的内存在 srcMx 的 L1 上）
3. MX 格式配置 Mmad（设置 `dualDstCtl = 0b01`，行为无大幅变化）
4. Fixpipe（使用 `CFG_ROW_MAJOR/CFG_XIC_fxpipe` 等参数）

#### 5.7.3 AIC/AIV 直连通路（融合算子创新）

新架构引入直连通道：
- `UB2L1&L12UB`：UB 与 L1 之间双向直通
- `L0C2UB`：L0C 直连 UB（相比 910 减少 GM 中转）

**关键接口**：
- `DataCopy` (shortcut 版)：简化 CV 融合算子开发
- `CrossConvWaitParams`、`CreateConvCntl`：控制跨 AIC/AIV 数据同步

#### 5.7.4 DualDest（L0C→UB/GM 双目标输出）

```cpp
template <typename T, typename U, const FixpipeConfig& config = CFG_ROW_MAJOR>
__aicore__ inline void FixpipeParams(C310Layout format, COC2Layout::ROW_MAJOR, &intraParams)

// dualDstCtl 参数含义
// 0     = 标准模式
// 2'b01 = 流水线模式（pipeline）
// 2'b10 = 阈值分流（M*N 每次送 M/2 到 AIV0，M/2 到 AIV1）
// 2'b11 = 行阈值分流模式
```

---

## 6. 数据精度与量化

### 6.1 支持精度

来源：昇腾950特性全景剖析、HiF8 训推实践

`FP32 / HF32 / BF16 / FP16 / S8 / FP8 (E4M3, E5M2) / MXFP8 / MXFP4 / HiF8 / FP4 (e1m2, e2m1)`

### 6.2 HiFloat8 (HiF8)

来源：Ascend 950 HiF8 模型量化技术的训推实践、OSP-Next

- **格式**：1-bit S + 可变 Exponent + 3-bit M + Denormal 区。最大值 ~32768.0（FP8-E4M3 最大 448.0）。
- **Scaling 策略**：
  - **CTS (Current per-Tensor Scaling)**：每步算 Amax，快但易不稳。
  - **DTS (Delayed per-Tensor Scaling)**：Interval=5~20 迭代更新，含 Amax History (64/128/256)、Safety Margin、更新/锁定阶段。
- **粒度组合**：W Per-Channel + A Per-Tensor + C Per-Tensor。
- **NPU 算子**：`npu_dynamic_quant / npu_quant_matmul / npu_dtype_cast / npu_trans_quant_param / npu_format_cast`。
- **效果**：DeepSeek-V3 HiF8 vs BF16 = 1.113×；vs MXFP8 = 1.295×；KV Cache 节省 ~20-50%；64K 超长序列 Attention 加速 1.7-2.6×；OLMo-1B 1.8T tokens 训练 loss 差距 <0.5%。

### 6.3 MXFP8 / MXFP4

- MX 系列共享 `e8m0` Scale，32:1 压缩。
- 主要用于 Linear/MoE 层；与 HiFloat8 互补。

---

## 7. 大模型实践案例

### 7.1 DeepSeek-V4 集群优化

来源：DeepSeek-V4的950集群优化实践

- 参数 1.6 TB（Dense 等效 284 B）；vs V3.2（685 B / 160 K FFN）+27% Flops。
- **MoE**：3-hash-routing + TopK-6（384+1 Expert）；GroupedMatMul；EP Dispatch/Combine。
- **Hybrid Attention**：
  - **Win**：128 大小窗口。
  - **CSA (Compressed Sparse Attention)**：4+overlap，Lightning Indexer TopK，K512/K1024。
  - **HCA (Head-wise Compression)**：128 维压缩。
- **KV Cache**：Flash 13 B → Pro 49 B；分布式 State Cache（Support Score + History）。
- **mHC (mixed-head-context)**：AscendC `HcPre/HcPost`、PyPTO `HcPre`、TileLang `DSKernel`。
- **并行策略**：
  - Prefill：CP+EP，zig-zag context chunk，Win+CSA+HCA AllGather。
  - Decode：DP+EP，专家负载均衡。
- **量化矩阵**：A3 → A8W8 + Indexer；A5 → FP8 MoE + MXFP4 Linear + MXFP8 A8W8 + Indexer C8。

### 7.2 LongCat-Flash 推理（来自 HiF8 实践）

- TP=8、EP=32 配置；A8W8 量化：MMLU-Pro −0.27、CMMLU +0.77、GSM8K 90.8→90.60。
- W-Per-Channel/Per-Token 可挽回 0.5~3% 精度。
- 64K 超长序列 1.70×~2.60× 加速。

### 7.3 OSP-Next 文生视频

来源：基于稀疏系列并行和HiF8量化实践的OSP-Next文生视频模型

- Open-Sora Plan 系列：v1.0/1.2/1.3/1.5 → **OSP-Next**（2026-05）。
- 14K+ stars，VBench v1.5 = 83.02%（HunyuanVideo 同档）。
- **SkiParse Sparse Attention**：相比 Full / 2+1D / 3D Attention，IO 复杂度更优。
- **SSP (Sparse Sequence Parallel)**：新的一层并行维度，叠在 DP/FSDP/SP 之上；含 local rearrange + All-to-All；相比基线提速 ~75%。
- **训练管线**：BF16 SkiParse + GRPO → HiF8 SFT（精度损失 0.70%，质量 +4.26%）→ HiF8-RL（GRPO，损失 0.44%，质量 +4.71%）。
- 仓库：`cann-recipes-infer`、`cann-recipes-train`。

### 7.4 TorchTitan-NPU 训练

来源：TorchTitan-NPU PDF（全读）

- PyTorch Native + `torch.compile` + Inductor FX，入口：`inductor_npu_ext`。
- **5D 并行**：DTensor + DeviceMesh + FSDP2 + TP + PP + EP + CP。
- **Converters**（配置文件指定）：DSA→`npu_sparse_lightning_indexer / npu_sparse_flash_attention`；GMM→`npu_grouped_matmul`；Permute→`npu_moe_token_(un)permute`；RMSNorm→`npu_rms_norm`；RoPE→`npu_rotary_mul`。
- **融合算子收益**：
  - RMSNorm 融合后 177fps（+84.2%）；GMM 时间 5.1→2.4ms(-0.7ms, +22.6%)
  - 开启DSA融合降低内存占用，同时提升速度

**Virtual Optimizer**：
- 核心：申请 Host 侧内存但虚拟地址映射到 Device 的张量，参与 NPU 算子计算
- 实现 Host/Device 分离的梯度累积/权重更新，大幅减少 HBM 压力

**自定义CP（Context Parallelism）**：
- SDPA Ulysses CP（Llama/DeepSeekV3）：All-to-All实现QKV块分布
- DSA自定义CP（DeepSeek-V3.2）：CustomContextParallelContext基类，用户子类化定义CP patch逻辑
- 提供扩展新CP范式的能力

**FSDP2简化并行**：
- 替代 PP+FSDP，解决PP bubble不均衡问题；零冗余权重，更小内存；A3超节点高带宽掩盖通信

**Inductor + AutoFuse 三大优化**：

1. **Host-Bound消减**：Inductor静态分析转化动态调度为预编译执行流，单层消除 ~2ms Host延迟
2. **Memory-Bound访存消减**：Vertical Fusion将相邻小算子合并为单Kernel，中间变量仅存寄存器；Top-K计算 229.3→152.5μs
3. **前端冗余消除**：识别 repeats=1 冗余视图；连续Pointwise算子代码生成合并；Rope 126μs→15μs

**TPAsync并行**：将通信与计算同时进行（Compute-Communication Fusion），隐藏AllGather通信延迟

**DFX & Agent 能力**：
- **精度异常定位**：Claude Code + GPT 5.3 **7分钟**定位 vs 人工 0.5天
  - 流程：召回异常→误差比较→loss曲线→确定范围→属性分析→定位算子→修复补丁
- **OOM诊断**：Agent **20分钟** vs 人工 3天
  - 流程：OOM类型判断→snapshot采集→语义化分析→配置修复建议

**训练性能评估**（A3 64卡）：
- DeepSeek-V3：TP+EP+FSDP2 + AutoFuse → **+38.5%**，整网 **576 tokens/p/s**
- DeepSeek-V4 mHC结构：Vector算子加速 **1.81×**，Free time **3.31×**，精整时间 **1.32×**

**Roadmap**（26年Q2-Q3）：
- Q2：DeepSeek-V4-Pro支持、Muon优化器、SFT/RL能力
- Q3：DeepSeek V4 8B/16B Mega Hub

---

## 8. 性能分析与调优工具链

来源：Ascend C 编译与调试调优、面向下一代硬件的性能调优、CANNBot Vector 排序优化

### 8.1 编译与开发

- **编译器**：BiSheng，`--npu-arch dav-3510`；CMake `find_package(ASC)`；Host C++ + Device ASC 分离编译。
- **IDE**：VS Code 插件 / MindStudio。
- **PyTorch 集成**：`TORCH_LIBRARY / TORCH_LIBRARY_IMPL`，`PrivateUse1DispatchKey`，`torch.ops.load_library`。

### 8.2 调试 (msdebug + mssanitizer)

- `printf / assert / DumpTensor / timestamp`；`asc_dump_gm/ubuf/cbuf/reg`。
- `msdebug`：CoreDump、栈回溯。
- `mssanitizer`：`memcheck / racecheck (RAW 冒险) / initcheck / synccheck`。

### 8.3 性能分析 (msProf / Insight)

- **msprof op**：Op 级别分析。
- 指标族：**Timeline / Occupancy / Memory / Roofline / Source / PcSampling**。
- CSV 输出：`OpBasicInfo / ArithmeticUtilization / L2Cache / Memory / MemoryL0`。
- MindStudio **Insight**：可视化（导入 trace_view、内存调优、CCU/通信、SIMT GPR/IPC、Pipe-bubble）。
- 数据采集：PyTorch / TensorFlow / ACL API；采样 100 Hz~10 kHz。
- Pipe-bubble：`AscendC::MarkStampImpl`、事件 ID14/ID15。
- AICore Block 级 PMU + TLB Miss；`sys-hardware-mem=on` 全局内存分析。
- 通用工具：`msopgen / msopst / msobjdump`。

### 8.4 探索 950 性能天花板

来源：探索Ascend 950的性能天花板

- Matmul 优化路线：**SWAT (Sliding Window Adaptive Tiling) → StreamK Tiling → MXFP32/HiF8 调度**。
- RMSNormQuant 融合：M 维分块降寄存器压力；UB 128 B 对齐 + Pad 降 25% 内存压力；VF `vdiv/vmul/vmuls/vadd` 流水。
- FIA (Fused Inference Attention)：Cube QK & PV + Vector Softmax/Cast/Transpose；NZ↔ND 转换；Flash-Decoding 支持。
- CCU：AllGather+MatMul 融合 +70%；MoE Dispatch&Combine +20%+。
- 学习路径：`ops-samples` → `recipes` (infer/train/embodied-intelligence)。

---

## 9. 典型优化案例数据点

来源：昇腾950利用率提升的奥秘、TileLang 典型算子、CANNBot Vector 排序

### 9.1 MXFP4 Quant Matmul（昇腾950 利用率）

- 基线 408 μs → 175 μs，**2.33×**。
- 步骤：Double Buffer 1.99× → SWAT 2.07× → UnitFlag 2.11× → L1 Bank Conflict 2.25× → Scale 2.33×。

### 9.2 RmsNorm

- 7693 μs → 49.0 μs，**157×**。
- 步骤：Gamma 1.13× → RegBase 67.7× → Double Buffer 91.5× → UB 优化 141.7× → rsqrt 融合 157×。

### 9.3 FlashAttention Scalar

- 10.6 μs → 5.9 μs，**1.79×**（ICache 1.03× + 其他优化）。

### 9.4 TileLang Flash Attention

- 相对 Ascend C 性能：36% → 47%（Cube gemm + L0 DB）→ 55%（Vector DB + prefetch）→ 63%（axpy + scalar）→ 80%（Pipeline num_stages=8, cross_interval=2）。
- 相对 PyTorch ≈ 60%。

### 9.5 CANNBot Vector Top-K 排序 8 版本完整迭代

来源：CANNBot进阶开发（全读）

**场景**：BF16 K=794,880，bit-exact 对齐 torch.topk，15种分布全PASS
**Human+Agent 协作**：7步循环迭代（提问题→Agent写方案→写kernel→测试定位→Human决策→优化→收敛?）

**算法选型**：Radix Selection（O(N+b)），16-bit sortable空间，≤16次迭代必收敛；Heap/Sort方案因内存或速度不可行

**8版本迭代（代表性节点）**：

| 版本 | 关键技术 | 时间 | 核心收益 |
|-----|---------|------|---------|
| v1 | BF16→Sortable保序映射（正数 raw^0x8000，负数 ~raw），7条向量指令 | - | 无浮点精度损失 |
| v3 | 标量+XOR fast-skip，16×16 Nibble表（避免向量ReduceSum误差） | 132→29ms(-78%) | Pass2阶段1/256元素才满足条件，避免向量浪费 |
| v5 | 16步向量二分搜索，Pass0一次性VtoSort | 20→14ms(-32%) | 省去18次重复复写 |
| v6 | TQue Double Buffer（TQue<VECIN,2>，Prolog预加载2chunks，Steady并行Compute+CopyIn+2） | -1ms | 借助CAKE Agent的Double Buffer skill |
| v7 | Early Stop + 动态GT-mask（GE mask 99.5%→GT mask 0.25%）+ rawThresh预计算 | All-zeros: 71.6→29.3ms(-59%); Sparse99.5%: 64→23ms(-64%) | 极端分布特化 |
| v8 | Chunk-level Round-robin（每个core处理{0,C,2C...}轮询），Vector核心负载均衡 | All-zeros: 29→8.2ms(-3.5×) | 借助CAKE Agent的负载均衡skill |

**最终结果**（2026-05-14实测，15种分布精度全PASS）：
- V8: 8.0~14.8 ms；V7: 13.2~40.6 ms；torch.topk: 23.4~27.1 ms（未排序）
- V8在所有分布下均优于 torch.topk；All-zeros 极端场景：8.3ms（7.4×于V1基线）

**CANNBot知识库四大维度**：
- 算法类：Radix Selection / Heap TopK / Bitonic Sort / QuickSelect
- 并行/硬件类：MTE2‖Vec流水、Double buffer、Cache-line/DMA burst、跨核同步
- 数值/精度类：浮点保序映射（**关键！**）、整数累加避免ReduceSum误差、Tie-break规则
- 优化模式：round-robin分区、fast-skip早停、Worst-case极端分布特化

---

## 10. Issue 仓库统计

数据来源：`issue/*.csv`（导出时间 2026-05-28）。

### 10.1 概览

| 仓库 | issue 数 | open | closed | 主导类型 |
|------|---------:|-----:|-------:|----------|
| `cann/pypto` | 1944 | 196 | 1748 | 任务 1269 / 缺陷 251 / 需求 212 / 咨询 146 / 文档 58 |
| `cann/asc-devkit` | 733 | 59 | 674 | 需求 264 / 缺陷 187 / 文档 161 / 任务 78 / 咨询 38 |
| `Ascend/msinsight` | 295 | 42 | 253 | Bug-Report 261 / 其它 16 / 需求 10 |

### 10.2 PyPTO 高频标签

`resolved(794) / Passes(296) / Machine(207) / Frontend(172) / requirement(161) / documentation(149) / green-light(146) / bug-report(136) / Operations(136) / CodeGen(62) / infrastructure(60) / Interpreter(49) / Operator(44) / Distribute(42) / Simulation(27)`

→ 模块画像：**Frontend / Passes / Machine（状态机）/ CodeGen / Interpreter / Operator / Distribute / Simulation**。"green-light" 表示已加入门禁验证集。

### 10.3 asc-devkit 标签

`resolved(468) / Accepted(426) / requirement(144) / bug-report(53) / documentation(32) / CVE/UNFIXED(7) / good-first-issue(6) / CVE/UNAFFECTED(4)`

→ 以**需求**和**文档**主导，含少量 CVE 跟踪。

### 10.4 msinsight 标签

`resolved(244) / triaged(231) / bug(148) / feature(83) / medium-priority(71) / document(33) / usage(30) / stale(18) / pending(17) / good-first-issue(16) / high-priority(9) / low-priority(4) / triage-review(4) / question(3) / help-wanted(3)`

→ 三级优先级 + triaged 流程；以 Bug + Feature 为主。

### 10.5 典型问题画像（采样）

- **PyPTO 缺陷**：`assemble` 计算图错误、`interleave_rope` 性能低于 AscendC、`remainder` 广播精度、`view/reshape` 精度异常、`A3Var` 部分场景精度错误、`create_shmem_Tensor` 算子前置失败、950 AICORE 打印 L0C_TO_UB 报 `errcode:0 timeout/trap`、CV 通路 Mix 子图问题、`VF 融合最大个数` 限制、合轴 / 换轴相关精度。
- **PyPTO 需求**：错误信息增强需带具体值、HostCache 支持、`machine` 状态机、`bfloat16` 运算支持、精度工具适配 vector `index_add`。
- **asc-devkit**：SIMT 入门样例、`npuarch==5102` 初始化 SOC 寄存器、`hifloat8` 转 `float` 文档、CAPI 增加同步/系统变量/矢量接口、Tiling 模板化动态 Shape 失败、Cast 精度、ReduceMax 处理 −inf 异常、webIDE 编译错误、`matmul` 高阶 API 头文件过大、`fixpipe_co12gm_quantization_s322s8` 文档算子规格不一致。
- **msinsight**：PyTorch snapshot 分析、A5 aicore 双 die 适配、`CANN B110` profiling NPU 下发解析缺失、JupyterLab 插件文档、Trace 导入显示问题、内存调优数据切换 `Failed to get device id`、Triton 内存数据未刷新、内存快照潜在泄漏 tensor 识别。

---

## 11. 关键外部链接

- 社区主页：<https://gitcode.com/cann>、<https://www.hiascend.com/cann>
- 主要仓库：
  - PyPTO issues：<https://gitcode.com/cann/pypto>
  - asc-devkit issues：<https://gitcode.com/cann/asc-devkit>
  - MindStudio Insight：<https://gitcode.com/Ascend/msinsight>
  - cann-samples / cannbot-skills / cann-recipes-infer / cann-recipes-train / catlass / blas / ops-basic / ops-nn 等
- 文档：
  - PyPTO 性能调试：<https://pypto.gitcode.com/tutorials/debug/performance.html>
  - Ascend C：<https://www.hiascend.com/cann/ascend-c>
  - Ascend C SIG：`gitcode.com/cann/community/blob/master/CANN/sigs/Ascend C/README.md`
- 第三方：`tile-ai/tilelang-ascend`（GitHub）、AtomGit 镜像。

---

## 12. 文件清单（含一句话索引）

### 12.1 `950others/`（核心文档）

| 文件 | 一句话主题 |
|------|------------|
| CANN Session致辞.pdf | CANN 生态全景、社区治理与版本路线图 |
| 昇腾950特性全景剖析.pdf | 950 Chiplet/AI Core/HiBL/CCU/SuperPOD 全面剖析 |
| 面向新一代硬件，CANN技术架构的变与不变.pdf | CANN 在 950 上的架构演进策略与 API 三层 |
| 昇腾950利用率提升的奥秘.pdf | MXFP4 Matmul / RmsNorm / FA Scalar 三个优化案例 |
| 场景驱动下的算子编程语言选型.pdf | AsNumpy/PyPTO/Triton/TileLang/Ascend C 的对比与选型 |
| 基于下一代Ascend平台的Ascend C算子编程概述.pdf | Ascend C 编程模型与 SIMD/SIMT 全景 |
| Ascend C算子编译与调试调优能力概述.pdf | BiSheng + msdebug + mssanitizer + msProf 工具链 |
| 基于下一代Ascend平台的SIMT编程介绍.pdf | AIV SIMT 线程块/warp/同步原语详解 |
| 基于下一代硬件的Ascend C Reg矢量编程.pdf | Reg/VF 编程：Load/Store/算术/内存屏障 |
| 基于下一代硬件的Ascend C SIMD与SIMT混合编程.pdf | Cube+Vector、SIMD+SIMT 单 kernel 混合范式 |
| 基于下一代硬件的Cube编程.pdf | Matmul/MXFP8/Fixpipe/DualDst/Flash Attention Grad |
| PTO ISA教你如何快速上手昇腾950.pdf | PTO 抽象机器、TLOAD/TSTORE、Roofline、Swizzle |
| PyPTO：Hello, World!.pdf | PyPTO 环境搭建与最小化例子 |
| PyPTO：Tensor 的算子编程范式.pdf | Tensor IR + 动态 Shape + Loop/Cond |
| PyPTO 模型融合算子实操.pdf | DeepSeek-V3.2 Indexer 融合算子端到端 |
| PyPTO IDE调优工具实操.pdf | VS Code 插件：编译/IR diff/性能提示 |
| Ascend 950 HiF8模型量化技术的训推实践.pdf | HiF8 格式、CTS/DTS、LongCat-Flash、MLA 量化 |
| DeepSeek-V4的950集群优化实践.pdf | Hybrid Attention (Win+CSA+HCA) + MoE + KV 压缩 |
| 基于稀疏系列并行和HiF8量化实践的OSP-Next文生视频模型.pdf | OSP-Next：SkiParse + SSP + HiF8-RL |

### 12.2 `profiling/`

| 文件 | 一句话主题 |
|------|------------|
| 面向下一代硬件的性能调优.pdf | Profiling 体系：msprof + Insight + Roofline + SIMT 指标 |
| 探索Ascend 950的性能天花板.pdf | Matmul/RMSNormQuant/FIA/CCU 突破性能上限的实践 |
| TileLang典型算子性能优化.pdf | Flash Attention / Sparse FA 渐进优化到 80% |
| CANNBot进阶开发：Vector算子之排序性能优化.pdf | Top-K 8 版本迭代 + Radix Selection + Early Stop |
| TorchTitan-NPU：训练性能与易用性齐飞，开启昇腾训练入图新体验.pdf | PyTorch Native + 5D 并行 + AutoFuse + DFX Agent |

### 12.3 `issue/`

| 文件 | 仓库 | 数量 |
|------|------|-----:|
| `perf_PYPTO.csv` | cann/pypto | 1944 |
| `perf_asc-devkit.csv` | cann/asc-devkit | 733 |
| `perf_insight.csv` | Ascend/msinsight | 295 |

CSV 字段：`标题, 项目, 链接, 描述, 指派人, 里程碑, 标签, 优先级, 自定义类型, 自定义状态, 状态, 创建人, 创建时间, 更新时间, 关联PR链接, 关闭时间`。

---

## 13. 后续问答提示

- 当问题涉及"950 硬件 / 内存层级 / Cube / Vector"，主参考 §3、§5.3.5、§5.4。
- 涉及"PyPTO / 入门 / API"，主参考 §5.2。
- 涉及"Ascend C / SIMT / SIMD / Reg"，主参考 §5.3。
- 涉及"性能分析 / Profiling / msProf / Roofline"，主参考 §8。
- 涉及"HiF8 / MXFP8 / 量化"，主参考 §6。
- 涉及"DeepSeek-V4 / OSP-Next / TorchTitan"，主参考 §7。
- 涉及"具体 issue / bug / 需求"，先按 §10 中模块标签筛选，再到 `issue/*.csv` 中按关键字搜索；标题前缀约定：`[Bug-Report|缺陷反馈]`、`[Requirement|需求建议]`、`[Documentation|文档反馈]`、`[Question|问题咨询]`、`[Task|任务跟踪]`。
- 文本检索建议在 `_extracted/` 目录下用 grep，对应文件名规则：`<dir>__<原PDF文件名>.txt`。
