# WZSoft 企业级低代码平台 - 代码说明文档

> 基于 Spring Boot 2.6.6 的后端系统，包名 `com.wzsoft.main`，Maven 构建，WAR 打包。

---

## ⚠️ PRE-FLIGHT：动手前强制检查（跳过 = 重复踩坑）

**每次写平台相关代码前，先执行这步，否则已知错误会一再重犯：**

```
grep -i "<关键词>" C:\Users\sz_wi\.claude\projects\D--Mywork-wsoftclaude\memory\MEMORY.md
```

### 按任务类型查对应关键词：

| 任务 | 必查关键词 |
|------|-----------|
| 创建 App/权限 | `app`, `APPID`, `dataappadd`, `PAGEIDS`, `SNUMSUB`, `dataroleupd` |
| 表单/组件 | `formsave`, `formsubmit`, `comconfig`, `COMID`, `getDataItem`, `comconfigPara` |
| 数据集/表 | `dataformadd`, `CODES`, `selview`, `VIEWCODES`, `DATATYPE` |
| WFM 工作流 | `WFM`, `enddo`, `approve`, `worklist`, `wfmflag` |
| 页面创建 | `pageadd`, `formsave`, `container`, `templatecontent`, `filecontent` |
| 遇到 500 错误 | `codelogs`（先去 `admin/codelogs/*.txt` 看异常，再查代码） |

### 硬规则（来自血泪教训）：

1. **永远不用 admin 测试业务功能** — admin 绕过角色/WFM/数据权限
2. **创建前先查存在** — App/数据集/页面都需幂等检查，`dataappadd` 不防重
3. **APPID 用 UUID** — `genUUID()`，不用可读字符串
4. **data_form.LOCATION 不带 `form_` 前缀** — 平台运行时自动加
5. **`/api/dataadd` 必须带 `field_FORM`** — 否则 `checkCpachaMobile` NPE
6. **`code.para` 不能 NULL** — WFM enddo 执行时 `Map.get("para").toString()` 无判空
7. **`wfmflag` 是单字符** — `'1'`=批准, `'0'`=拒绝, 列类型是 `varchar(1)`
8. **SNUMSUB 用 `/api/dataupd` 修** — `dataappupd` 会覆盖
9. **`dataroleupd` 是替换不是合并** — 必须传完整 APPIDS+VIEWCODES
10. **comconfig 值必须参照工作正常的同 COMID 条目** — 写入前从 `json_*.txt` 找同 COMID+同 fieldtype 的参照，逐字段对值；找不到参照的用最简值（纯整数、无逗号/特殊字符）；写入后立即 `node --check` 验证生成的 JS，语法错则值有问题

### 调试铁律：

- 500 且无详情 → **立即查** `admin/codelogs/` 最新 `.txt` 文件
- API 返回 `"no rights"` → 检查 `role_dataview.VIEWCODE` 和 `role_app.APPID`
- 不确定 API 参数 → 先 grep Java 源码找 `@RequestMapping` 和 setter/getter
- 数据不对 → 直接 `mysql -h 192.168.150.90 -u admin -p111111 dbwzsoft` 查

---

## 一、技术栈

| 技术 | 用途 |
|------|------|
| Spring Boot 2.6.6 | 核心框架 |
| Spring Security | 认证与授权 |
| Spring JDBC (JdbcTemplate) | 数据库访问 |
| MyBatis | ORM（部分使用） |
| Redis + spring-session | 缓存 + Session 共享 |
| ActiveMQ | 消息队列 |
| Nacos | 服务注册发现 |
| Nashorn (OpenJDK) | JavaScript 脚本引擎 |
| fastjson 1.2.83 | JSON 序列化 |
| jjwt 0.9.0 | JWT 令牌 |
| iText + Flying Saucer | PDF 生成 |
| OpenCSV | CSV 导出 |
| Thymeleaf | 模板引擎 |
| Java 8 | 运行环境 |

**支持的数据库**：MySQL、Oracle、人大金仓 (KingBase)、达梦 (DM)、SQL Server

---

## 二、整体架构

### 目录结构
```
src/main/java/com/wzsoft/main/
├── 配置类 (5个)
│   ├── MainApplication          # 启动入口
│   ├── SecurityConfig           # Spring Security 配置
│   ├── RedisConfig              # Redis 模板配置
│   ├── AppConfig                # RestTemplate Bean
│   └── ActiveMqConfig           # ActiveMQ 连接工厂
│
├── 安全与认证 (8个)
│   ├── JwtUtil                  # JWT 生成/解析
│   ├── JwtAuthenticationTokenFilter  # JWT 过滤器
│   ├── SecurityDiyProvider      # 自定义认证提供者
│   ├── UserDetailsServiceImpl   # 用户详情加载
│   ├── UserLogin                # 登录用户封装
│   ├── User                     # 用户实体
│   ├── UserError                # 用户错误
│   └── UserAop                  # 用户 AOP 切面
│
├── REST Controllers (18个)
│   ├── LoginRestController      # 登录/注册/验证码
│   ├── LogoutController         # 登出
│   ├── DatalistRestController   # 数据列表 CRUD (核心)
│   ├── DataRestController       # 数据操作
│   ├── FormRestController       # 表单管理
│   ├── ComRestController         # 组件管理
│   ├── AppRestController        # 应用管理
│   ├── CodeGenRestController    # 代码生成管理
│   ├── ConfigRestController     # 系统配置
│   ├── MenuRestController       # 菜单管理
│   ├── OrgRestController        # 组织架构
│   ├── DeptRestController       # 部门管理
│   ├── PsnRestController        # 人员管理
│   ├── RoleRestController       # 角色管理
│   ├── WfmRestController        # 工作流管理
│   ├── PortalDatalistRestController # 门户数据接口
│   ├── TmpRestController        # 临时接口
│   └── MsgTempRestController    # 消息模板
│
├── Services (10个)
│   ├── DatalistService          # 数据服务 (核心，2000+行)
│   ├── CodeGenService           # 代码生成服务 (JS 引擎)
│   ├── WfmService               # 工作流服务
│   ├── LoginService             # 登录服务
│   ├── ConfigService            # 配置服务
│   ├── AppService               # 应用服务
│   ├── PsnService               # 人员服务
│   ├── DeptService              # 部门服务
│   ├── OrgService               # 组织服务
│   ├── RoleService              # 角色服务
│   ├── MsgService               # 消息服务
│   └── MsgTempService           # 消息模板服务
│
├── 文件服务 (5个)
│   ├── FileController           # 文件上传下载入口
│   ├── FileStorageServiceImpl   # 文件存储实现
│   ├── FileStorageProperties    # 存储路径配置
│   ├── FileContentService       # 文件内容数据库操作
│   └── FileConfig               # 静态资源映射
│
├── 工具类 (8个)
│   ├── WSoftUtil                # 通用工具 (文件、PDF、DB适配等)
│   ├── WSoftUtilBase64          # Base64 编码
│   ├── WSoftUtilZip             # ZIP 压缩/解压
│   ├── WSoftCpacha              # 验证码生成
│   ├── WSoftMsg                 # 多语言消息
│   ├── WSoftPdfHeaderFooter     # PDF 页眉页脚
│   ├── RedisCache               # Redis 缓存封装
│   └── DatalistDao              # 数据访问层 (DAO)
│
├── HTTP 客户端 (4个)
│   ├── HttpClients              # HTTP 客户端
│   ├── HTTPSClient              # HTTPS 客户端
│   ├── HTTPSClientUtil          # HTTPS 工具
│   └── HTTPSTrustClient         # 信任所有证书的 HTTPS 客户端
│
├── 其他 (4个)
│   ├── FastJsonRedisSerializer  # fastjson Redis 序列化器
│   ├── SpringTask               # 定时任务
│   ├── UserLog                  # 用户日志
│   └── ...
```

---

## 三、核心模块详解

### 3.1 认证与授权流程

```
用户登录 → LoginRestController.login()
         → LoginService.login()
         → AuthenticationManager.authenticate()
         → SecurityDiyProvider.authenticate()
         → UserDetailsServiceImpl.loadUserByUsername()
            └→ 查询 psn 表获取用户信息
            └→ 查询 psn_role 获取角色列表
         → JWT 生成 → 存入 Redis (key: login:{userId})
         → 返回 token

后续请求 → JwtAuthenticationTokenFilter
         → 从 URL 参数获取 token
         → JwtUtil.parseJWT() 解析出 userId
         → 从 Redis 获取 UserLogin 对象
         → 非 ID=1 用户检查 rolepages 权限
         → 放行或拒绝
```

**关键文件**：
- `JwtUtil.java` - JWT 工具类（HS256 算法，密钥硬编码为 "sangeng"）
- `JwtAuthenticationTokenFilter.java` - 请求拦截，验证 token 和页面权限
- `SecurityConfig.java` - 配置白名单路径、禁用 CSRF、注册 JWT 过滤器

**权限模型**：
- 用户 → 角色 (psn_role) → 应用 (role_app) → 页面 (app_page)
- 用户 → 角色 → 数据视图权限 (role_dataview)
- 特殊用户 ID=1（超级管理员）绕过所有权限检查

### 3.2 数据列表 (低代码核心)

**架构**：用户通过可视化界面配置数据视图（`data` 表），系统根据配置动态生成查询、新增、修改、删除操作。

```
DatalistRestController (API入口)
├── /api/datalist      - 分页查询
├── /api/dataget       - 获取单条数据
├── /api/dataadd       - 新增数据
├── /api/dataupd       - 修改数据
├── /api/datasubmit    - 提交数据（触发工作流）
├── /api/datadel       - 删除数据
├── /api/datalistexcel - 导出 CSV
├── /api/datagenpdf    - 生成 PDF
└── /api/datainit      - 初始化表单
```

**数据流向**：
```
1. Controller 接收 JSONObject (viewCode + 参数)
2. 检查权限 (checkRights → 用户角色 vs data 表配置)
3. DatalistService 处理:
   ├── codeUpd()       - 执行 "beforeUpd" 脚本校验
   ├── getDataRights()  - 按角色生成 SQL 过滤条件
   ├── codeGetDatasCache() - 执行查询 (支持 Redis 缓存)
   └── codeUpdView()   - 执行 "afterUpd" 脚本
4. 结果返回前端
```

**数据库表**：
- `data` - 数据视图配置（表名、SQL、代码钩子）
- `data_fields` - 字段定义
- `data_fields_com` - 字段与表单组件的关联
- `data_form` - 表单页面配置

### 3.3 代码生成器 (可视化 JS 引擎)

这是平台的**核心低代码能力**：用户通过可视化界面拖拽节点，系统将其编译为 JavaScript 代码并存储在数据库中，运行时通过 Nashorn 引擎执行。

```
CodeGenRestController
├── /api/codesave    - 保存代码配置 → CodeGenService.codeDeal() 编译 JS
├── /api/codeDo      - 执行代码       → CodeGenService.codeDo() → Nashorn eval()
├── /api/codeget     - 读取代码
├── /api/codedel     - 删除代码
├── /api/codeimport  - 导入代码包
├── /api/codeexport  - 导出代码包
└── /api/codedebuglog- 调试日志
```

**代码类型 (codemode)**：
- `1` - 手动执行（通过 `/api/codeDo` 调用）
- `2` - 定时任务（由 `SpringTask` 调度）

**JS 节点类型**：
| 类型 | 功能 |
|------|------|
| `assign` | 变量赋值 |
| `insDb` | 插入数据库 |
| `updDb` | 更新数据库 |
| `delDb` | 删除数据库 |
| `assignDb` | 查询赋值 |
| `subcode` | 调用子函数 |
| `if/for/while` | 条件/循环控制 |
| `msg` | 发送消息 |
| `outSvr` | HTTP 外部调用 |

**执行上下文注入**：
```javascript
// Nashorn 脚本中可用的变量
mapPara['访问人ID']        // 当前用户 ID
mapPara['访问人部门ID']    // 部门 ID
mapPara['访问人机构ID']    // 机构 ID
mapPara['访问人角色']      // 角色列表
datalistService           // 完整数据库操作能力
mRequest                  // HttpServletRequest (仅 codeDo)
```

### 3.4 工作流引擎

```
WfmRestController
├── /api/wfmworksubmit   - 提交流程
├── /api/wfmworkapprove  - 审批/驳回
├── /api/wfmworklist     - 待办列表
├── /api/wfmworkget      - 获取待办详情
└── /api/wfmworkgetlist  - 获取关联待办
```

**核心流程**：
```
提交 → WfmService.submitDatas()
     → 创建 wfm_run_node + wfm_run_worklist 记录
     → 执行节点 startdo 脚本
     → 根据 dutytree/dutyloop 分配处理人

审批 → WfmService.approveDatas()
     → 检查多人审批模式 (needall)
     → 找到下一个节点 (connections)
     → 执行 enddo 脚本
     → 更新状态 (sysstatus)
     → 发送邮件通知

驳回 → 退回到指定节点
     → 清除后续节点
     → 重新创建待办
```

**工作流数据库**：
- `wfm` - 流程定义（JSON 存储在文件系统中）
- `wfm_run_node` - 运行中的节点
- `wfm_run_worklist` - 待办事项
- `wfm_entrust` - 委托记录

### 3.5 文件服务

```
FileController
├── /api/uploadfile      - 上传文件（存入数据库记录）
├── /api/uploadfilenodb  - 上传文件（仅存文件系统）
├── /api/downloadfile    - 下载文件
└── /api/deletefile      - 删除文件
```

**存储路径**：
```
filesvr/uploadfiles/datafiles/{日期}/{guid}.{后缀}  # 普通文件
filesvr/pdffiles/{日期}/{guid}.pdf                  # PDF 文件
```

**数据库记录**：
- `filecontent` 表存储文件 GUID、文件名、路径、大小、类型

### 3.6 消息系统

```
MsgService → 发送站内消息 (msg_msg 表)
           → 发送邮件 (msg_mail 表)

消息模板 → msg_template 表定义模板
         → [@变量名@] 占位符替换
         → 支持邮件(m)、站内消息(p)、短信(外部API)
```

**ActiveMQ 集成**：
- `ActiveMqConfig` 配置连接 `tcp://192.168.150.90:61616`
- `MsgService.sendMsgSingle()` 通过 JMS 发送消息

---

## 四、数据流向与关键表

```
┌─────────────────────────────────────────────────┐
│                    用户层                          │
│  登录 → 选择角色/机构 → 访问应用 → 操作表单/数据     │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                   认证层                           │
│  JWT → Redis Session → 角色权限 → 页面权限 → 数据权限│
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                   业务层                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 数据列表  │ │ 代码执行  │ │  工作流   │          │
│  │ 增删改查  │ │ JS引擎   │ │ 审批流转   │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 文件管理  │ │ 消息通知  │ │ PDF生成   │          │
│  └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                   数据层                           │
│  psn / org / dept / role (组织用户)                │
│  data / data_fields / data_form (数据视图)          │
│  code / code_funcs (代码定义)                      │
│  wfm_* (工作流)                                    │
│  filecontent (文件)                                │
│  msg_msg / msg_mail / msg_template (消息)          │
└─────────────────────────────────────────────────┘
```

---

## 五、多数据库适配

`WSoftUtil` 中实现了数据库差异的封装：

| 方法 | 功能 |
|------|------|
| `dbSqlIsOracle()` | 判断是否 Oracle |
| `dbSqlIsMysql()` | 判断是否 MySQL |
| `dbSqlIsKingbase()` | 判断是否人大金仓 |
| `dbSqlIsDm()` | 判断是否达梦 |
| `dbSqlIsSqlserver()` | 判断是否 SQL Server |
| `dbSqlTopFirst("1")` | TOP/LIMIT 语法适配 |
| `dbSqlSysdate()` | 系统时间函数适配 |
| `dbSqlAutoIDGet()` | 自增 ID 获取 (SEQUENCE/LAST_INSERT_ID) |
| `dbSqlLikeByField()` | LIKE 语法适配 |
| `dbSqlDealInStr()` | IN 子句语法适配 |
| `dbDealListMap()` | KingBase 结果集 key 大小写处理 |

---

## 六、缓存策略

```
Redis Key 命名规范:
login:{userId}          # 用户登录 Session
gDataRedisTime          # 数据查询缓存过期时间(秒)
gCodeFunc               # 全局代码函数
codedebuglog            # 代码调试日志
ldback:{base64(sql)}    # 数据查询结果缓存
{codeGuid}              # 代码源文件缓存
```

**查询缓存机制** (`codeGetDatasCache`)：
1. 将 SQL + 参数 Base64 编码作为 key
2. 检查 Redis 中是否有缓存
3. 对比 `data_upd_time` 表判断相关表是否变更
4. 无变更则返回缓存，否则重新查询并刷新

---

## 七、文件存储与部署

```
filesvr/
├── config/     # 系统配置文件
├── codes/      # 可视化代码生成的 JS 文件
├── codelogs/   # 代码执行错误日志
├── pdffiles/   # 生成的 PDF 文件
├── templates/  # PDF 模板文件
├── uploadfiles/  # 用户上传文件
│   └── datafiles/
├── wfms/       # 工作流定义文件
├── portal/     # 门户前端页面
├── manage/     # 管理后台前端页面
└── codes/      # 代码文件
```

**启动时**：`SecurityConfig.copyFileSvr()` 将 `filesvr/` 下的文件拷贝到 classpath 对应目录。

---

## 八、定时任务

`SpringTask` - 由 `@EnableScheduling` 驱动：
- 扫描 `code` 表中 `codemode='2'` 的定时任务
- 支持按小时/天/周/月/年执行
- 执行后更新 `tasklastrun` 时间戳

---

## 九、安全相关注意事项

**已知问题**（审计发现）：

1. **JWT 密钥硬编码**：`JwtUtil.JWT_KEY = "sangeng"` — 任何人可伪造 token
2. **fastjson AutoType 开启**：全局启用 `setAutoTypeSupport(true)` — RCE 风险
3. **Nashorn 脚本引擎**：多处 `engine.eval()` 执行存储于 DB 的 JS 代码 — 需严格管控代码管理权限
4. **SQL 拼接**：部分查询使用字符串拼接而非参数化查询（表名拼接场景）
5. **CSRF 禁用**：`httpSecurity.csrf().disable()`
6. **Token URL 传参**：`request.getParameter("token")` — 易被日志捕获
7. **超级管理员特权**：ID=1 绕过所有权限检查

---

## 十、开发建议

1. **新增数据视图**：在 `data` 表配置表名和字段，前端自动生成表单
2. **新增业务代码**：通过代码生成器可视化配置，或在 `/api/codesave` 中保存
3. **新增工作流**：在 `wfms/` 目录放置 JSON 流程定义文件
4. **数据权限**：在代码配置中为角色绑定 `selview/selupd` 权限代码
5. **PDF 模板**：在 `templates/` 放置 HTML 模板，使用 `[@字段名@]` 占位符

---

## 十一、API 调用实战经验

### 11.1 认证方式

**管理员 (ID=1) 登录：**
- POST `/user/login`，Body: `{"userName":"admin","password":"111111","cpachacode":"1234","lan":"c"}`
- 验证码校验已注释掉（LoginRestController.java:167-169），但需传非空值
- 返回 `{"msg":"","token":""}` — token 为空，admin 使用 **Session 认证** (JSESSIONID Cookie)
- curl 需用 `-c cookies.txt -b cookies.txt` 保持会话

**普通用户登录：**
- 返回 JWT token，后续请求通过 URL 参数 `?token=xxx` 传递
- JWT 存于 Redis key `login:{userId}`
- 会话包含：menupc, menumobile, rolepages, mrole

**权限过滤器 (JwtAuthenticationTokenFilter) 行为：**
- 拦截 `.html` 和 `/api/` 路径（`/portal/` 和 `/upload/` 除外）
- 先检查 SecurityContext 是否有已有认证（Session 方式）
- 无认证则从 `token` URL 参数解析 JWT
- ID=1 跳过所有角色页面权限检查

### 11.2 API 调用技巧

**中文编码问题：** curl `-d` 参数含中文时触发 400 错误，需使用文件方式：
```bash
printf '{"key":"中文值"}' > /tmp/payload.json
curl -d @/tmp/payload.json -H "Content-Type: application/json" ...
```

**Session 过期：** API 返回 400/500 时先重新登录获取新鲜 session。

**datalist API 可能 500：** 若 `/api/datalist` 不可用，直接用专用 REST 端点（PageRestController、FormRestController）代替。

**字段命名注意：** 前端 JS 中字段大小写不一致，后端 JSON 读取时用大写（如 `field_PAGETYPE`）。

### 11.3 门户页面配置完整流程

平台有两类页面：
- `pagetype=1`：内部页面，需认证，文件生成到 `/manage/`
- `pagetype=2`：公共门户页面，无需认证，文件生成到 `/portal/`，可公开访问

**创建页面：** POST `/api/pageadd`
```json
{
  "viewCode": "page",
  "field_NAME": "页面名称",
  "field_LOCATION": "pub{name}.html",
  "field_PAGETYPE": "2",
  "field_APPTYPE": "1",
  "templateLocation": "blankpub.html",
  "field_TEMPLOCATION": "blankpub"
}
```
- 门户页面 location 自动加 "pub" 前缀
- 可用模板：blankpub.html, default.html, blankform.html 等（位于 filesvr/templates/）
- 返回 `[{"msg":"","pid":{pageId}}]`

**设计页面：** POST `/api/formsave`
```json
{
  "filename": "pub{name}.html",
  "templatefile": "temp_pub{name}.html",
  "pageLocation": "pub{name}.html",
  "pageType": "2",
  "pageTemp": "blankpub",
  "appType": "1",
  "backPage": "pageportal.html",
  "templatecontent": "<div>HTML内容</div>",
  "filecontent": "<div>HTML内容</div>",
  "comconfig": [],
  "comAttrsField": {}
}
```
- 平台自动将内容嵌入输出模板（`*out.html`），生成最终 HTML 到 `filesvr/portal/`
- 同步拷贝到 classpath 对应目录以供访问

**访问地址：** `/portal/pub{name}.html`（`/portal/**` 在 SecurityConfig 中 permitAll）

**页面管理界面入口：** 管理员登录 → 公共功能 → 页面管理（pageportal.html 对应 pagetype=2）
