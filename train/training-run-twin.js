(function () {
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const graphvizAssetPaths = {
    dense: "../../pto-design-system/patterns/model-graphviz/assets/qwen7b_modelviz.html",
    moe: "../../pto-design-system/patterns/model-graphviz/assets/deepseek_v32_modelviz.html",
  };
  const themeParam = new URLSearchParams(window.location.search).get("theme");
  let currentTheme = themeParam === "dark" || themeParam === "light"
    ? themeParam
    : document.documentElement.dataset.theme === "light" ? "light" : "dark";

  function graphvizSrc(kind) {
    const path = graphvizAssetPaths[kind] || graphvizAssetPaths.dense;
    return `${path}?theme=${currentTheme}&embed=1`;
  }

  const models = {
    qwen3: {
      name: "Qwen3-8B",
      title: "Qwen3-8B 架构解释",
      meta: "Dense decoder · 36 layers · hidden 4096 · TP2 PP1",
      run: "run qwen3-8b-r12",
      graphKind: "dense",
      seq: "4096",
      parallel: "TP2 · PP1",
      batch: "MBS1 · GBS128",
      params: 8e9,
      target: 8e10,
      summary: "Token IDs 进入 Embedding，经过 36 个 Dense Decoder Layer，Attention 和 SwiGLU MLP 交替加工，最后由 LM Head 输出 logits。",
      snippet: [
        'MODEL_ARGS="--num-layers 36 --hidden-size 4096 --num-attention-heads 32"',
        'TRAIN_ARGS="--seq-length 4096 --tensor-model-parallel-size 2 --pipeline-model-parallel-size 1"',
        'DATA_ARGS="--tokenizer-name-or-path ${TOKENIZER_PATH} --data-path ${DATA_PATH}"',
      ].join("\n"),
      decision: {
        title: "当前配置可进入短跑验证",
        body: "建议先运行 200 step，观察 loss 是否下降、HBM 是否稳定、通信等待是否超过 20%。",
      },
      checks: [
        ["ok", "TOKENIZER_PATH 已配置", "tokenizer 与 Qwen3 权重路径一致。"],
        ["ok", "DATA_PATH 前缀完整", "数据前缀指向 mmap/bin 索引文件。"],
        ["warn", "TP2 需要匹配权重转换", "如果从 HF 权重启动，需要确认转换目标并行度。"],
      ],
      graph: [
        ["input", "Token IDs", "input", 300, 42, 180, 58],
        ["embed", "Embedding", "vocab -> hidden", 300, 128, 220, 68],
        ["attn", "Attention", "32 heads", 155, 236, 220, 68],
        ["mlp", "SwiGLU MLP", "intermediate 22016", 445, 236, 240, 68],
        ["norm", "RMSNorm", "pre + final", 300, 344, 210, 62],
        ["head", "LM Head", "logits", 300, 430, 210, 62],
      ],
      edges: [["input", "embed"], ["embed", "attn"], ["embed", "mlp"], ["attn", "norm"], ["mlp", "norm"], ["norm", "head"]],
      paramLinks: {
        seq: { nodes: ["input", "embed", "attn"], note: "SEQ_LENGTH 决定 Token IDs 的长度，最直接放大 Attention 的计算量和 KV/激活显存。" },
        parallel: { nodes: ["attn", "mlp", "norm"], note: "TP/PP 把 Attention、MLP 和 Decoder 层拆到多卡；切分方式必须和脚本、权重转换一致。" },
        batch: { nodes: ["input", "embed", "head"], note: "MBS/GBS 决定每次进入模型的样本规模和梯度累积，影响吞吐、显存和收敛折中。" },
      },
    },
    qwen7b: {
      name: "Qwen7B",
      title: "Qwen7B 本地源码闭环",
      meta: "Dense decoder · 32 layers · hidden 4096 · source verified",
      run: "run qwen7b-source-r03",
      graphKind: "dense",
      seq: "8192",
      parallel: "TP1 · PP1",
      batch: "MBS1 · GBS64",
      params: 7e9,
      target: 5e10,
      summary: "Qwen7B 适合建立 README、config.json、modeling_qwen.py、generation_config 和 safetensors index 之间的对应关系。",
      snippet: [
        '"num_hidden_layers": 32, "hidden_size": 4096, "num_attention_heads": 32',
        '"seq_length": 8192, "vocab_size": 151936, "intermediate_size": 22016',
        '"top_p": 0.8, "top_k": 0, "max_new_tokens": 512',
      ].join("\n"),
      decision: {
        title: "适合做第一张模型地图",
        body: "建议用它校准源码、config、权重索引和推理配置，再进入 Qwen3 Ascend 训练链路。",
      },
      checks: [
        ["ok", "config.json 可映射架构图", "层数、hidden、head、词表和上下文长度都有本地证据。"],
        ["ok", "safetensors index 可定位权重 shard", "适合解释权重不是单个大文件。"],
        ["warn", "不是本机全量训练对象", "作为学习闭环更合适，训练需转向可控脚本。"],
      ],
      graph: [
        ["readme", "README", "source", 84, 84, 160, 58],
        ["config", "config.json", "params", 84, 188, 180, 58],
        ["code", "modeling_qwen.py", "modules", 84, 316, 210, 58],
        ["embed", "Embedding", "151936 x 4096", 430, 84, 240, 68],
        ["attn", "Attention", "32 heads", 350, 208, 210, 68],
        ["mlp", "SwiGLU MLP", "22016", 580, 208, 210, 68],
        ["norm", "RMSNorm", "pre + final", 465, 326, 210, 62],
        ["head", "LM Head", "top_p / eos", 465, 430, 210, 62],
      ],
      edges: [["readme", "config"], ["config", "embed"], ["code", "attn"], ["code", "mlp"], ["embed", "attn"], ["embed", "mlp"], ["attn", "norm"], ["mlp", "norm"], ["norm", "head"]],
      paramLinks: {
        seq: { nodes: ["config", "embed", "attn"], note: "Qwen7B 的 seq_length 来自 config，本质上影响输入序列进入 Embedding 后的 Attention 范围。" },
        parallel: { nodes: ["config", "attn", "mlp"], note: "Qwen7B 学习页主要用 TP/PP 建立概念，真实训练还要匹配权重切分和脚本启动方式。" },
        batch: { nodes: ["config", "head"], note: "Batch 不改变模型结构，但会改变一次前后向覆盖多少 token，最终反映到 logits/loss 的统计稳定性。" },
      },
    },
    qwenmoe: {
      name: "Qwen3-MoE",
      title: "Qwen3-MoE 专家路由解释",
      meta: "MoE decoder · router topk · expert parallel",
      run: "run qwen3-moe-a3b-r06",
      graphKind: "moe",
      seq: "4096 / 16384",
      parallel: "TP2 · PP4 · EP8",
      batch: "MBS1 · GBS128",
      params: 30e9,
      target: 1.5e11,
      summary: "MoE 的重点不是参数更多，而是 token 先经过 router，再按 TopK 选择专家，EP 和 all-to-all 会直接影响通信。",
      snippet: [
        'MOE_ARGS="--num-experts 128 --moe-router-topk 8 --expert-model-parallel-size 8"',
        'TRAIN_ARGS="--seq-length 4096 --tensor-model-parallel-size 2 --pipeline-model-parallel-size 4"',
        'DPO_ARGS="--global-batch-size 128 --recompute-granularity full"',
      ].join("\n"),
      decision: {
        title: "进入进阶训练解释",
        body: "建议同时观察 expert 负载、all-to-all 通信、recompute 和长上下文 HBM 压力。",
      },
      checks: [
        ["ok", "EP 与 num_experts 已绑定", "专家并行需要和 world size 一起解释。"],
        ["warn", "all-to-all 通信风险", "router topk 增大后通信和负载均衡都会变化。"],
        ["ok", "DPO 数据格式可检查", "chosen/rejected 数据需要进入体检项。"],
      ],
      graph: [
        ["input", "Token IDs", "input", 300, 42, 180, 58],
        ["embed", "Embedding", "hidden", 300, 128, 220, 68],
        ["router", "Router", "topk experts", 300, 226, 220, 68],
        ["expertA", "Expert Group A", "EP shard", 150, 336, 220, 62],
        ["expertB", "Expert Group B", "EP shard", 450, 336, 220, 62],
        ["merge", "Combine", "weighted sum", 300, 430, 220, 62],
      ],
      edges: [["input", "embed"], ["embed", "router"], ["router", "expertA"], ["router", "expertB"], ["expertA", "merge"], ["expertB", "merge"]],
      paramLinks: {
        seq: { nodes: ["input", "embed", "router"], note: "长上下文先扩大 token 序列，再让更多 token 进入 router，增加路由和专家通信压力。" },
        parallel: { nodes: ["router", "expertA", "expertB"], note: "EP 与专家组强绑定；router 的 TopK 选择会决定 all-to-all 通信和负载均衡风险。" },
        batch: { nodes: ["input", "router", "merge"], note: "Batch 增大后，router 和专家合并阶段同时承压，吞吐收益和通信风险要一起看。" },
      },
    },
    deepseek: {
      name: "DeepSeek V3.2",
      title: "DeepSeek V3.2 工程复杂度解释",
      meta: "671B MoE · MLA · DSA · MTP · TP/PP/EP/CP",
      run: "run deepseek-v32-r02",
      graphKind: "moe",
      seq: "16384+",
      parallel: "TP4 · PP8 · EP64 · CP2",
      batch: "MBS1 · GBS256",
      params: 671e9,
      target: 3e12,
      summary: "DeepSeek V3.2 把 MLA、Sparse Indexer、MoE、MTP、长上下文和多维并行放到同一条解释链里。",
      snippet: [
        'MODEL_ARGS="--num-experts 256 --moe-router-topk 8 --enable-dsa-indexer"',
        'PARALLEL_ARGS="--tensor-model-parallel-size 4 --pipeline-model-parallel-size 8 --expert-model-parallel-size 64"',
        'ATTN_ARGS="--use-sparse-flash-attn --context-parallel-size 2"',
      ].join("\n"),
      decision: {
        title: "建议作为专家模式样例",
        body: "先不要让初学者直接照抄脚本，应该用它解释 MLA、DSA、EP、CP 和 profiling 归因。",
      },
      checks: [
        ["warn", "多维并行需整体校验", "TP/PP/EP/CP 与节点数、rank 和权重切分强相关。"],
        ["warn", "DSA 与 sparse attention 需成对解释", "索引器、稀疏注意力和长上下文不能孤立看。"],
        ["danger", "必须采集 profiling 摘要", "没有通信/显存证据时，很难定位瓶颈。"],
      ],
      graph: [
        ["input", "Token IDs", "long context", 300, 36, 190, 58],
        ["mla", "MLA", "compressed KV", 170, 128, 220, 68],
        ["dsa", "DSA Indexer", "sparse select", 430, 128, 230, 68],
        ["router", "MoE Router", "topk 8", 300, 238, 220, 68],
        ["experts", "256 Experts", "EP64", 170, 350, 220, 62],
        ["mtp", "MTP", "multi-token", 430, 350, 220, 62],
        ["head", "LM Head", "logits", 300, 438, 220, 62],
      ],
      edges: [["input", "mla"], ["input", "dsa"], ["mla", "router"], ["dsa", "router"], ["router", "experts"], ["router", "mtp"], ["experts", "head"], ["mtp", "head"]],
      paramLinks: {
        seq: { nodes: ["input", "mla", "dsa"], note: "DeepSeek 的长上下文会同时牵动 MLA、DSA Indexer 和 Sparse Attention 路径。" },
        parallel: { nodes: ["router", "experts", "mtp"], note: "TP/PP/EP/CP 同时出现时，router、experts 和 MTP 的通信域必须一起校验。" },
        batch: { nodes: ["input", "router", "head"], note: "Batch 放大 token 流量，风险会从输入、MoE 路由一路传导到 logits/loss。" },
      },
    },
  };

  const hardwareProfiles = {
    single8: { label: "8 × Ascend 910B · 1 节点", devices: 64, world: 8, cols: 16, unit: "AI Core 槽位", unitHint: "单节点细粒度视图" },
    cluster64: { label: "64 × Ascend 910B · 8 节点", devices: 64, world: 64, cols: 16, unit: "NPU 卡槽", unitHint: "集群聚合视图" },
    cluster512: { label: "512 × Ascend NPU · 64 节点", devices: 512, world: 512, cols: 32, unit: "NPU 卡槽", unitHint: "集群聚合视图" },
  };

  const phaseSteps = [
    { id: "tokens", label: "Tokens", nodeId: "input_tokens", nodeLabel: "Token IDs", summary: "当前 micro batch 已切成 token ids，准备进入 embedding 查表。" },
    { id: "embedding", label: "Embedding", nodeId: "token_embedding", nodeLabel: "Embedding", summary: "Token IDs 正在映射为 hidden states，词表维度会影响 embedding 和 LM Head。" },
    { id: "attention", label: "Attention", nodeId: "scaled_attention", nodeLabel: "Scaled Attention", summary: "当前层在计算上下文依赖，序列长度会直接放大 attention 计算和 KV 压力。" },
    { id: "mlp", label: "SwiGLU", nodeId: "silu_multiply", nodeLabel: "SwiGLU MLP", summary: "MLP 分支执行 Gate/Up 投影和 SiLU Multiply，是 Dense decoder 的主要算力消耗之一。" },
    { id: "norm", label: "Norm", nodeId: "final_norm", nodeLabel: "Final RMSNorm", summary: "Decoder 输出进入最终 RMSNorm，准备投影到词表 logits。" },
    { id: "logits", label: "Logits", nodeId: "lm_head", nodeLabel: "LM Head", summary: "LM Head 生成 logits，随后进入 loss、反向传播和优化器更新。" },
  ];

  const state = {
    model: "qwen7b",
    task: "pretrain",
    hardware: "cluster512",
    step: 48230,
    totalSteps: 120000,
    loss: 2.182,
    lossEMA: 2.182,
    val: 2.246,
    mfu: 0.512,
    gn: 0.84,
    seen: 3.3e10,
    spike: 0,
    riskHist: 0.08,
    phase: "embedding",
    manualPhaseUntil: 0,
    hist: { loss: [], val: [], mfu: [], gn: [] },
    devices: [],
  };

  const TP_VALUES = [1, 2, 4, 8];
  const PP_VALUES = [1, 2, 4, 8, 16];
  const MB_VALUES = [1, 2, 4, 8];
  const GA_VALUES = [1, 2, 4, 8, 16, 64];
  const baseline = { mfu: 0.512, tokps: 0, eta: 0 };

  function fmtBig(n) {
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
    return Math.round(n).toString();
  }

  function fmtTime(seconds) {
    const safeSeconds = Math.max(0, seconds);
    const days = Math.floor(safeSeconds / 86400);
    const hours = Math.floor((safeSeconds % 86400) / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  function pathFor(data, width, height, pad = 5) {
    let min = Math.min(...data);
    let max = Math.max(...data);
    if (max - min < 1e-6) max = min + 1;
    return data.map((value, index) => {
      const x = pad + ((width - 2 * pad) * index) / (data.length - 1);
      const y = height - pad - ((height - 2 * pad) * (value - min)) / (max - min);
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  function drawChart(svg, series) {
    const [, , width, height] = svg.getAttribute("viewBox").split(" ").map(Number);
    const base = `<line class="twin-chart-baseline" x1="0" y1="${height - 5}" x2="${width}" y2="${height - 5}"></line>`;
    const body = series.map((item) => {
      const path = pathFor(item.data, width, height);
      const area = item.area ? `<path class="${item.area}" d="${path} L${width - 5} ${height - 5} L5 ${height - 5} Z"></path>` : "";
      return `${area}<path class="twin-chart-line ${item.className}" d="${path}"></path>`;
    }).join("");
    svg.innerHTML = `${base}${body}`;
  }

  function seedHistory() {
    state.hist = { loss: [], val: [], mfu: [], gn: [] };
    for (let index = 0; index < 96; index += 1) {
      const t = index / 96;
      const loss = 2.55 - 0.42 * t + (Math.random() - 0.5) * 0.04;
      state.hist.loss.push(loss);
      state.hist.val.push(loss + 0.06 + (Math.random() - 0.5) * 0.02);
      state.hist.mfu.push(51 + (Math.random() - 0.5) * 5);
      state.hist.gn.push(0.8 + (Math.random() - 0.5) * 0.25);
    }
    state.loss = state.hist.loss[state.hist.loss.length - 1];
    state.lossEMA = state.loss;
  }

  function resetDevices() {
    const profile = hardwareProfiles[state.hardware];
    state.devices = [];
    for (let index = 0; index < profile.devices; index += 1) {
      let util = rand(0.72, 0.94);
      if (Math.random() < 0.08) util = rand(0.48, 0.68);
      if (Math.random() < 0.12) util = rand(0.94, 0.99);
      state.devices.push({
        util,
        temp: rand(57, 68) + util * 8,
        mem: rand(0.68, 0.86),
        bad: false,
      });
    }
    if (state.devices[37]) {
      state.devices[37].temp = 83;
      state.devices[37].bad = "straggler";
      state.devices[37].util = 0.52;
    }
    if (state.devices[201]) state.devices[201].util = 0.58;
    if (state.devices[330]) state.devices[330].temp = 84;
    renderHeatShell();
  }

  function renderHeatShell() {
    const heat = $("heat");
    const profile = hardwareProfiles[state.hardware];
    heat.style.gridTemplateColumns = `repeat(${profile.cols}, minmax(0, 1fr))`;
    heat.innerHTML = "";
    state.devices.forEach((_, index) => {
      const cell = document.createElement("div");
      cell.className = "twin-heat-cell";
      cell.dataset.index = String(index);
      heat.appendChild(cell);
    });
  }

  function renderHeat() {
    const cells = $("heat").children;
    const profile = hardwareProfiles[state.hardware];
    let peak = 0;
    let thermalRisk = 0;
    let lowUtil = 0;
    let total = 0;
    let totalUtil = 0;
    state.devices.forEach((device, index) => {
      const targetTemp = 54 + device.util * 23 + (device.bad ? 8 : 0);
      device.temp = clamp(device.temp * 0.86 + (targetTemp + rand(-2.2, 2.2)) * 0.14, 50, 92);
      device.util = clamp(device.util + (Math.random() - 0.5) * 0.025, 0.45, 1);
      peak = Math.max(peak, device.temp);
      total += device.temp;
      totalUtil += device.util;
      if (device.temp > 82 || device.bad) thermalRisk += 1;
      if (device.util < 0.7) lowUtil += 1;
      const cell = cells[index];
      if (!cell) return;
      cell.className = "twin-heat-cell";
      if (device.util < 0.7) cell.classList.add("is-util-low");
      else if (device.util > 0.92) cell.classList.add("is-util-high");
      else cell.classList.add("is-util-mid");
      if (device.temp > 82 || device.bad) cell.classList.add("is-thermal-risk");
      if (device.bad) cell.classList.add("is-straggler");
      const tip = [
        `${profile.unit} ${index}`,
        `node-${Math.floor(index / 8)} / rank-${index}`,
        `算力占用率 ${(device.util * 100).toFixed(0)}%`,
        `温度 ${device.temp.toFixed(0)}°C`,
        `HBM ${(device.mem * 100).toFixed(0)}%`,
        profile.unitHint,
        device.bad ? `风险 ${device.bad}` : "",
      ].filter(Boolean).join("\n");
      cell.dataset.tip = tip;
    });
    const avgUtil = totalUtil / state.devices.length;
    $("heatStat").textContent = `util ${(avgUtil * 100).toFixed(0)}% · peak ${peak.toFixed(0)}°C · low ${lowUtil} · risk ${thermalRisk}`;
    $("hwUtil").textContent = `${(avgUtil * 100).toFixed(0)}%`;
    $("hwLow").textContent = `${lowUtil}`;
    $("hwThermal").textContent = `${thermalRisk}`;
    $("hwAction").textContent = lowUtil > state.devices.length * 0.05
      ? "查低利用 rank"
      : thermalRisk > 0
        ? "查降频/散热"
        : "继续观察";
  }

  function renderArchitecture() {
    const model = models[state.model];
    $("architectureTitle").textContent = model.title;
    $("architectureMeta").textContent = model.meta;
    $("runId").textContent = model.run;
    $("scriptChecks").innerHTML = model.checks.map(([stateValue, title, body]) => (
      `<div class="twin-check" data-state="${stateValue}"><div><strong>${title}</strong><small>${body}</small></div></div>`
    )).join("");
    const frame = $("modelGraphFrame");
    const src = graphvizSrc(model.graphKind);
    if (frame && frame.getAttribute("src") !== src) {
      frame.setAttribute("src", src);
    }
  }

  function applyTheme(theme, options = {}) {
    currentTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    document.body.dataset.theme = currentTheme;
    const themeToggle = $("themeToggle");
    const themeToggleLabel = $("themeToggleLabel");
    const nextMode = currentTheme === "light" ? "深色模式" : "浅色模式";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(currentTheme === "light"));
      themeToggle.setAttribute("title", `切换${nextMode}`);
    }
    if (themeToggleLabel) {
      themeToggleLabel.textContent = nextMode;
    }
    if (!options.skipRender) renderArchitecture();
  }

  function toggleTheme() {
    applyTheme(currentTheme === "light" ? "dark" : "light");
  }

  function currentPhase() {
    return phaseSteps.find((phase) => phase.id === state.phase) || phaseSteps[0];
  }

  function focusGraphNode(nodeId) {
    const frame = $("modelGraphFrame");
    if (!frame || !frame.contentWindow || !nodeId) return;
    frame.contentWindow.postMessage({ type: "pto-model-graphviz-select-node", nodeId }, "*");
    try {
      frame.contentWindow.PtoQwenModelViz?.selectNode(nodeId);
    } catch (_) {
      // Cross-frame direct access is optional; postMessage is the primary path.
    }
  }

  function renderPhaseRail() {
    const rail = $("phaseRail");
    rail.innerHTML = "";
    phaseSteps.forEach((phase, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "twin-phase-step";
      button.dataset.phase = phase.id;
      button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${phase.label}</strong>`;
      button.addEventListener("click", () => {
        state.manualPhaseUntil = Date.now() + 8000;
        applyPhase(phase.id, { force: true });
      });
      rail.appendChild(button);
    });
  }

  function applyPhase(phaseId, options = {}) {
    if (!options.force && state.phase === phaseId) return;
    state.phase = phaseId;
    const phase = currentPhase();
    $("phaseSummary").textContent = phase.summary;
    $("phaseNode").textContent = phase.nodeLabel;
    document.querySelectorAll("[data-phase]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.phase === phase.id);
    });
    focusGraphNode(phase.nodeId);
  }

  function syncPhaseFromStep() {
    if (Date.now() < state.manualPhaseUntil) return;
    const phase = phaseSteps[Math.floor(state.step / 8) % phaseSteps.length];
    applyPhase(phase.id);
  }

  function currentTokps() {
    const model = models[state.model];
    const profile = hardwareProfiles[state.hardware];
    return Math.max(300, (state.mfu * profile.world * 312e12) / (6 * model.params));
  }

  function renderVitals() {
    const model = models[state.model];
    const tokps = currentTokps();
    const eta = (model.target - state.seen) / tokps;
    $("vStep").textContent = state.step.toLocaleString();
    $("vStepSub").textContent = `/ ${state.totalSteps.toLocaleString()} · ${(state.step / state.totalSteps * 100).toFixed(1)}%`;
    $("vLoss").textContent = state.loss.toFixed(3);
    $("vLossSub").textContent = `val ${state.val.toFixed(3)} · ema ${state.lossEMA.toFixed(3)}`;
    $("vMfu").textContent = `${(state.mfu * 100).toFixed(1)}%`;
    $("vEta").textContent = fmtTime(eta);
    $("lossNow").textContent = state.loss.toFixed(3);
    $("mfuNow").textContent = `${(state.mfu * 100).toFixed(1)}%`;
    $("gnNow").textContent = state.gn.toFixed(2);
    $("syncLag").textContent = `sync ${Math.floor(rand(8, 22))}ms`;
  }

  function renderCharts() {
    drawChart($("lossChart"), [
      { data: state.hist.val, className: "twin-chart-val" },
      { data: state.hist.loss, className: "twin-chart-loss", area: "twin-chart-area-loss" },
    ]);
    drawChart($("mfuChart"), [
      { data: state.hist.mfu, className: "twin-chart-mfu", area: "twin-chart-area-mfu" },
    ]);
    drawChart($("gnChart"), [
      { data: state.hist.gn, className: "twin-chart-grad" },
    ]);
  }

  function computeRisk() {
    let peak = 0;
    let bad = 0;
    let warm = 0;
    state.devices.forEach((device) => {
      peak = Math.max(peak, device.temp);
      if (device.bad) bad += 1;
      if (device.temp > 78) warm += 1;
    });
    const thermal = clamp((peak - 72) / 18, 0, 1);
    const straggler = clamp(bad * 0.35, 0, 1);
    const spike = clamp(state.spike, 0, 1);
    const hbm = clamp(warm / Math.max(8, state.devices.length * 0.03), 0, 1);
    const risk = clamp(0.05 + 0.42 * thermal + 0.28 * straggler + 0.26 * spike + 0.12 * hbm, 0.02, 0.95);
    state.riskHist = state.riskHist * 0.6 + risk * 0.4;
    return {
      risk: state.riskHist,
      factors: [
        ["热/降频", thermal],
        ["Straggler", straggler],
        ["Loss spike", spike],
        ["HBM 压力", hbm],
      ],
    };
  }

  function renderRisk() {
    const { risk, factors } = computeRisk();
    const pct = Math.round(risk * 100);
    const label = risk > 0.5 ? "高 · 建议 checkpoint" : risk > 0.22 ? "中 · 持续观察" : "低 · 稳定";
    $("riskNum").textContent = `${pct}%`;
    $("riskLabel").textContent = label;
    const factorsNode = $("factors");
    factorsNode.innerHTML = "";
    factors.forEach(([name, value]) => {
      const row = document.createElement("div");
      const nameNode = document.createElement("span");
      const track = document.createElement("div");
      const fill = document.createElement("div");
      const percent = document.createElement("strong");
      row.className = "twin-factor";
      nameNode.textContent = name;
      track.className = "twin-factor-track";
      fill.className = "twin-factor-fill";
      fill.style.width = `${Math.round(value * 100)}%`;
      percent.textContent = `${Math.round(value * 100)}%`;
      track.appendChild(fill);
      row.append(nameNode, track, percent);
      factorsNode.appendChild(row);
    });
  }

  const eventPool = [
    ["ok", "checkpoint 写入完成 · step {s} · 用时 41s"],
    ["ok", "loss EMA 持续下降 · 收敛正常"],
    ["info", "梯度同步耗时 11.2ms · overlap 92%"],
    ["warn", "node-{r} device{g} 结温 84°C · 触发降频预警"],
    ["warn", "straggler 检测 · node-37 落后 1.8x"],
    ["info", "数据分片 shard-{r} 预取完成"],
  ];

  function clock() {
    return new Date().toTimeString().slice(0, 8);
  }

  function pushEvent(sev, text) {
    const feed = $("feed");
    const el = document.createElement("div");
    el.className = "twin-event";
    el.dataset.sev = sev;
    el.innerHTML = `<time>${clock()}</time><i></i><span>${text}</span>`;
    feed.insertBefore(el, feed.firstChild);
    while (feed.children.length > 24) feed.removeChild(feed.lastChild);
  }

  function seedEvents() {
    $("feed").innerHTML = "";
    for (let index = 0; index < 5; index += 1) {
      const event = eventPool[Math.floor(rand(0, eventPool.length))];
      pushEvent(event[0], event[1].replace("{s}", state.step - index * 40).replace("{r}", Math.floor(rand(0, 64))).replace("{g}", Math.floor(rand(0, 8))));
    }
  }

  function modelMFU(config) {
    let mfu = 0.58;
    mfu -= (config.TP - 1) * 0.012;
    const bubble = (config.PP - 1) / (config.GA + config.PP - 1);
    mfu *= 1 - bubble * 0.6;
    if (config.MB < 2) mfu *= 0.9;
    return { mfu: clamp(mfu, 0.12, 0.62), bubble };
  }

  function renderWhatIf() {
    const config = {
      TP: TP_VALUES[Number($("rTP").value)],
      PP: PP_VALUES[Number($("rPP").value)],
      MB: MB_VALUES[Number($("rMB").value)],
      GA: GA_VALUES[Number($("rGA").value)],
    };
    $("lTP").textContent = config.TP;
    $("lPP").textContent = config.PP;
    $("lMB").textContent = config.MB;
    $("lGA").textContent = config.GA;
    const model = models[state.model];
    const profile = hardwareProfiles[state.hardware];
    const { mfu, bubble } = modelMFU(config);
    const tokps = Math.max(300, (profile.world * 312e12 * mfu) / (6 * model.params));
    const eta = (model.target - state.seen) / tokps;
    $("oMfu").textContent = `${(mfu * 100).toFixed(1)}%`;
    $("oTok").textContent = fmtBig(tokps);
    $("oEta").textContent = fmtTime(eta);
    $("oBub").textContent = `${(bubble * 100).toFixed(0)}%`;
    $("dMfu").textContent = `${((mfu - baseline.mfu) / baseline.mfu * 100).toFixed(0)}% vs 当前`;
    $("dTok").textContent = `${((tokps - baseline.tokps) / baseline.tokps * 100).toFixed(0)}% vs 当前`;
    $("dEta").textContent = `${((eta - baseline.eta) / baseline.eta * 100).toFixed(0)}% vs 当前`;
  }

  function tick() {
    state.step += 2;
    if (Math.random() < 0.025 && state.spike < 0.2) {
      state.spike = rand(0.45, 0.95);
      pushEvent("crit", `loss spike 检测 · ${(state.loss + rand(0.1, 0.28)).toFixed(3)} · 建议检查数据和梯度`);
    }
    const target = Math.max(1.55, state.lossEMA - 0.0008);
    state.loss = target + (Math.random() - 0.5) * 0.03 + state.spike * rand(0.05, 0.18);
    state.lossEMA = state.lossEMA * 0.98 + state.loss * 0.02;
    state.spike *= 0.78;
    state.val = state.lossEMA + 0.06 + (Math.random() - 0.5) * 0.015;
    state.mfu = clamp(0.512 + (Math.random() - 0.5) * 0.04 - state.spike * 0.05, 0.3, 0.62);
    state.gn = clamp(0.82 + (Math.random() - 0.5) * 0.3 + state.spike * 1.5, 0.2, 4);
    state.seen += currentTokps();
    state.hist.loss.push(state.loss);
    state.hist.val.push(state.val);
    state.hist.mfu.push(state.mfu * 100);
    state.hist.gn.push(state.gn);
    Object.values(state.hist).forEach((series) => {
      while (series.length > 96) series.shift();
    });
    if (Math.random() < 0.45) {
      const event = eventPool[Math.floor(rand(0, eventPool.length))];
      pushEvent(event[0], event[1].replace("{s}", state.step).replace("{r}", Math.floor(rand(0, 64))).replace("{g}", Math.floor(rand(0, 8))));
    }
    syncPhaseFromStep();
    renderAll();
  }

  function renderAll() {
    renderVitals();
    renderCharts();
    renderHeat();
    renderRisk();
    renderWhatIf();
  }

  function applyModel(modelKey) {
    state.model = modelKey;
    document.body.dataset.model = modelKey;
    document.querySelectorAll("[data-model-option]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.modelOption === modelKey);
    });
    state.seen = models[modelKey].target * 0.42;
    renderArchitecture();
    renderAll();
  }

  function applyTask(taskKey) {
    state.task = taskKey;
    document.body.dataset.task = taskKey;
    document.querySelectorAll("[data-task-option]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.taskOption === taskKey);
    });
  }

  function applyHardware(profileKey) {
    state.hardware = profileKey;
    document.body.dataset.hardware = profileKey;
    document.querySelectorAll("[data-hardware-option]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.hardwareOption === profileKey);
    });
    $("hardwareSummary").textContent = `${hardwareProfiles[profileKey].label}，每格为${hardwareProfiles[profileKey].unit}，底色表示算力占用率，角标表示温度/异常风险。`;
    resetDevices();
    baseline.tokps = currentTokps();
    baseline.eta = (models[state.model].target - state.seen) / baseline.tokps;
    renderAll();
  }

  function bindGraphFrame() {
    const frame = $("modelGraphFrame");
    frame.addEventListener("load", () => {
      focusGraphNode(currentPhase().nodeId);
    });
  }

  function bindControls() {
    bindGraphFrame();
    document.querySelectorAll("[data-model-option]").forEach((button) => {
      button.addEventListener("click", () => applyModel(button.dataset.modelOption));
    });
    document.querySelectorAll("[data-task-option]").forEach((button) => {
      button.addEventListener("click", () => applyTask(button.dataset.taskOption));
    });
    document.querySelectorAll("[data-hardware-option]").forEach((button) => {
      button.addEventListener("click", () => applyHardware(button.dataset.hardwareOption));
    });
    $("themeToggle")?.addEventListener("click", toggleTheme);
    ["rTP", "rPP", "rMB", "rGA"].forEach((id) => {
      $(id).addEventListener("input", renderWhatIf);
    });
  }

  function boot() {
    bindControls();
    applyTheme(currentTheme, { skipRender: true });
    renderPhaseRail();
    seedHistory();
    state.seen = models[state.model].target * 0.42;
    renderArchitecture();
    $("hardwareSummary").textContent = `${hardwareProfiles[state.hardware].label}，每格为${hardwareProfiles[state.hardware].unit}，底色表示算力占用率，角标表示温度/异常风险。`;
    resetDevices();
    seedEvents();
    baseline.tokps = currentTokps();
    baseline.eta = (models[state.model].target - state.seen) / baseline.tokps;
    applyPhase(state.phase, { force: true });
    renderAll();
    setInterval(tick, 1200);
  }

  boot();
})();
