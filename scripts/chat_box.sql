/*
 Navicat Premium Dump SQL

 Source Server         : lo
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : chat_box

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 11/12/2025 22:17:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for chat_messages
-- ----------------------------
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `chat_type` enum('digital','comprehensive','bazi','ziwei','marxist') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '聊天类型',
  `role` enum('user','assistant') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息角色',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chat_messages
-- ----------------------------

-- ----------------------------
-- Table structure for conversations
-- ----------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `chat_type` enum('digital','comprehensive','bazi','ziwei','marxist','zhongyi') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `messages` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_chat_type`(`user_id` ASC, `chat_type` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of conversations
-- ----------------------------
INSERT INTO `conversations` VALUES (10, 2, 'digital', '1 2 3 我想占卜我的事业发展', '[{\"role\": \"user\", \"content\": \"1 2 3 我想占卜我的事业发展\"}, {\"role\": \"assistant\", \"content\": \"### 🎯 起卦过程\\n根据你提供的数字 **1、2、3**，按照梅花易数规则起卦：\\n\\n1. **上卦计算**：第一个数字 **1** ÷ 8 = 0 余 **1** → 对应 **乾卦（☰ 天）**\\n2. **下卦计算**：第二个数字 **2** ÷ 8 = 0 余 **2** → 对应 **兑卦（☱ 泽）**\\n3. **动爻计算**：第三个数字 **3** ÷ 6 = 0 余 **3** → **第三爻变动**\\n\\n**卦象组合**：\\n- **䷪ 本卦：天泽履（上乾☰ + 下兑☱）**  \\n- **䷼ 互卦：风火家人（取本卦2-4爻为巽☴上卦，3-5爻为离☲下卦）**  \\n- **䷉ 变卦：乾为天（本卦第三爻阳变阴→上乾☰ + 下乾☰）**\\n\\n---\\n\\n### 🔮 卦象解读\\n\\n#### 1. 定体用\\n- **体卦（你）**：兑卦（☱ 泽 · **金**）→ 代表你当前的状态与根基  \\n- **用卦（事业）**：乾卦（☰ 天 · **金**）→ 代表事业发展与环境  \\n- **体用关系**：**体用比和（同属金）** → 主吉，象征你与事业目标本质相合，内外协调\\n\\n#### 2. 五行生克分析\\n- **体卦兑金**与**用卦乾金**比和 → 金金相生，无克无战  \\n- **互卦巽木（☴）生离火（☲）** → 木生火，暗示过程中需借人际协作（巽为风，表沟通）点燃行动力（离为火）  \\n- **变卦纯乾（☰）** → 金气极盛，终局将凝聚成稳固势能\\n\\n#### 3. 综合判断\\n**本卦履卦**：如《周易》云：“履虎尾，不咥人，亨”。你现阶段需**谨慎实践**（履为行路），虽遇挑战（如履虎尾），但只要步步为营，可化险为夷。  \\n**互卦家人卦**：**团队与家庭支持**（家人卦象）是中期关键，需重视合作与资源整合。  \\n**变卦乾卦**：**自强不息**（乾卦天行健）终得圆满，预示通过持续努力，事业将进入稳定上升期。\\n\\n**核心启示**：  \\n初始需以柔克刚（兑泽之柔润乾天之刚），中期借势协作（互卦风火相生），最终靠自律与坚持（变卦纯乾）达成目标。动爻在第三爻，提示你**近期决策需兼顾原则与灵活性**，避免因过度保守错失良机。\\n\\n---\\n\\n### 📜 注意事项\\n- 体用比和虽吉，仍须主动布局（乾卦重“健行”）  \\n- 互卦风火相生，留意贵人来自熟悉圈子（家人卦象）  \\n- 变卦双乾，警惕过于刚强易生孤立，需以兑卦的亲和力平衡\"}]', '2025-10-22 04:14:08', '2025-10-22 04:14:08');
INSERT INTO `conversations` VALUES (11, 1, 'digital', '123', '[{\"role\": \"user\", \"content\": \"123\"}, {\"role\": \"assistant\", \"content\": \"### 🎯 起卦过程\\n**数字输入**：1、2、3  \\n**计算步骤**：\\n1. **上卦**：第一个数 1 ÷ 8 = 0 余 **1** → 乾卦 ☰（天）  \\n2. **下卦**：第二个数 2 ÷ 8 = 0 余 **2** → 兑卦 ☱（泽）  \\n3. **动爻**：第三个数 3 ÷ 6 = 0 余 **3** → **第三爻变动**  \\n\\n**卦象生成**：\\n- **本卦**：上乾 ☰ + 下兑 ☱ → ䷉ **天泽履卦**  \\n- **互卦**：  \\n  - 本卦第2-4爻（九二阳、六三阴、九四阳）→ 离卦 ☲（火）  \\n  - 本卦第3-5爻（六三阴、九四阳、九五阳）→ 巽卦 ☴（风）  \\n  - 互卦：上离 ☲ + 下巽 ☴ → ䷥ **风火家人卦**  \\n- **变卦**：  \\n  - 本卦第三爻（六三阴爻）变为阳爻 → 上乾 ☰ + 下乾 ☰  \\n  - 变卦：䷀ **乾为天卦**  \\n\\n---\\n\\n### 🔮 卦象解读\\n**体用分析**：\\n- **体卦**：兑 ☱（泽，金）→ 代表问卦者自身  \\n- **用卦**：乾 ☰（天，金）→ 代表所问之事  \\n- **体用关系**：**体用比和**（五行同属金）→ 主吉，象征内外和谐  \\n\\n**五行生克**：  \\n体卦兑金与用卦乾金**五行相同**，为“比和”之象。  \\n- **结论**：事态发展顺畅，无需强力干预即可自然达成目标，但需注意金性刚硬，避免固执。\\n\\n**综合卦象解析**：\\n1. **本卦履卦**（䷉）：  \\n   - 《周易》卦辞：“履虎尾，不咥人，亨”  \\n   - 象征**谨慎行事**，如履薄冰却终能化险为夷，初始阶段需稳扎稳打。  \\n2. **互卦家人卦**（䷥）：  \\n   - 揭示过程中需**注重人际协作**（风火相生），家庭或团队支持是关键。  \\n3. **变卦乾卦**（䷀）：  \\n   - 《周易》卦辞：“元亨利贞”  \\n   - 预示最终将展现**刚健不息**之力，达成目标时需保持谦逊（阳极易悔）。  \\n\\n**动态关联**：  \\n初始谨慎（履卦）→ 借力他人（家人卦）→ 终得圆满（乾卦），整体呈现“由慎至强”的上升轨迹。动爻在第三爻（六三爻变），对应爻辞“眇能视，跛能履”，提示过程中需**扬长避短**，转化劣势为优势。\\n\\n---\\n\\n### 📜 注意事项\\n- 体用比和虽吉，但双金相叠易显刚锐，处事时需刚柔并济。  \\n- 变卦纯阳（乾卦）警示：成功後不可骄纵，须如《周易》所言“自强不息”。  \\n- 互卦风火相生，建议善用沟通（风象）与热情（火象）化解潜在矛盾。  \\n\\n> 卦理如镜，照见初心；言行合道，自得天时。\"}, {\"role\": \"user\", \"content\": \"1223215364\"}, {\"role\": \"assistant\", \"content\": \"### 🎯 起卦过程\\n#### 1. 数字分解与取余计算\\n根据《梅花易数》规则，取三个数字分别计算上卦、下卦与动爻：\\n- **上卦**：第1个数字 `1 ÷ 8 = 0` 余 **1** → 对应 **乾卦（☰ 天）**\\n- **下卦**：第2个数字 `2 ÷ 8 = 0` 余 **2** → 对应 **兑卦（☱ 泽）**\\n- **动爻**：第3个数字 `2 ÷ 6 = 0` 余 **2** → **第二爻变动**\\n\\n#### 2. 卦象生成\\n- **䷪ 本卦：天泽履（上乾☰ + 下兑☱）**\\n- **䷴ 互卦：风火家人**  \\n  取本卦第2-4爻（九二阳、六三阴、九四阳）→ **上巽☴（风）**  \\n  取本卦第3-5爻（六三阴、九四阳、九五阳）→ **下离☲（火）**\\n- **䷌ 变卦：天火同人（上乾☰ + 下离☲）**  \\n  本卦第二爻（九二阳爻）变为阴爻 → 下卦由兑☱（泽）转为离☲（火）\\n\\n---\\n\\n### 🔮 卦象解读\\n#### 1. 体用生克分析\\n- **体卦（你）**：乾☰（金）→ 象征刚健主动  \\n- **用卦（事）**：兑☱（金）→ 象征沟通愉悦  \\n- **体用关系**：**体用比和（同属金）**  \\n  → 主客和谐，事易成，但需防过于刚直\\n\\n#### 2. 卦象深层解析\\n##### ䷪ 本卦·天泽履\\n- 《周易》卦辞：“履虎尾，不咥人，亨”  \\n  如履薄冰却终能通达，暗示你当前需谨慎应对表面和谐中的潜在风险，尤其注意言辞分寸（兑为口舌）。\\n\\n##### ䷴ 互卦·风火家人\\n- 风火相生，揭示过程需借家庭/团队之力（家人卦象）。  \\n  互卦中离火生巽木 → **用生体**，预示中间阶段将得贵人相助。\\n\\n##### ䷌ 变卦·天火同人\\n- 乾天离火光明普照，卦辞：“同人于野，亨”  \\n  变卦形成火克金（离火克乾金）→ **用克体**，提醒最终阶段需收敛锋芒，以柔化刚，通过协作达成共识。\\n\\n---\\n\\n### 💎 综合判断\\n1. **当前态势（本卦）**：  \\n   看似顺利的沟通中暗藏挑战（履卦），你以强势姿态（乾金）主导局面，但需避免因直率引发摩擦（兑为口舌）。\\n   \\n2. **发展过程（互卦）**：  \\n   通过团队支持（家人卦）可化解矛盾，互卦用生体显示中期将获助力。\\n\\n3. **最终指向（变卦）**：  \\n   达成“同人”之和合境界，但变卦用克体警示：成功需以谦逊换合作，强求则易受反制。\\n\\n> 全卦链条：**谨慎开局（履）→ 借力中间（家人）→ 柔进终成（同人）**  \\n> 关键要义：刚柔并济，以和为贵。乾金之刚需离火之明来调和，方符“同人于野”的包容智慧。\\n\\n---\\n\\n📜 卦辞精要佐证  \\n- 《履·九二》：“履道坦坦，幽人贞吉” → 守正不移可化险为夷  \\n- 《同人·彖传》：“唯君子为能通天下之志” → 终局取决于胸怀与共享精神\"}]', '2025-10-22 04:15:16', '2025-10-22 04:26:23');
INSERT INTO `conversations` VALUES (12, 2, 'zhongyi', '请帮我分析一下我的身体状况', '[{\"role\": \"user\", \"content\": \"请帮我分析一下我的身体状况\"}, {\"role\": \"assistant\", \"content\": \"当然可以帮你分析身体状况，但需要你提供一些基本信息才能给出更有针对性的参考建议。请告诉我以下几个方面的情况（可以根据你的舒适度尽量详细描述）：\\n\\n**1. 主要症状或困扰：**\\n- 具体哪里不舒服？（例如：头痛、乏力、胃胀、关节痛等）\\n- 持续多久了？\\n- 什么情况下会加重或缓解？\\n\\n**2. 生活习惯：**\\n- 近期作息是否规律？每天睡眠时长和质量如何？\\n- 饮食情况（是否均衡？有无特殊饮食习惯？）\\n- 运动频率和强度？\\n- 是否有吸烟、饮酒等习惯？\\n\\n**3. 既往病史：**\\n- 是否患有慢性疾病（如高血压、糖尿病等）？\\n- 是否有手术史或过敏史？\\n- 家族中是否有遗传性疾病？\\n\\n**4. 近期检查数据（如有）：**\\n- 最近的体检报告（如血常规、肝功能、血压等）\\n- 影像学检查结果（如X光、B超等）\\n\\n**5. 其他相关信息：**\\n- 年龄、性别\\n- 近期是否经历重大生活事件或压力？\\n- 是否正在服用药物或保健品？\\n\\n---\\n\\n**举个例子：**\\n假设你告诉我：\\n_“我最近两周总是下午乏力，注意力不集中，晚上入睡困难，白天又嗜睡。饮食正常但饭后容易腹胀，运动较少，最近工作压力较大。”_\\n\\n**我的分析参考：**\\n1. 疲劳+睡眠障碍可能与压力导致的神经紧张或睡眠质量差有关；\\n2. 饭后腹胀需关注消化功能（如胃肠蠕动、饮食结构）；\\n3. 建议优先调整作息，尝试睡前放松训练，适当增加轻度运动，观察腹胀是否与特定食物相关。\\n\\n---\\n\\n⚠️ **重要提醒**：  \\n我的分析仅作为健康参考，**不能替代专业医疗诊断**。如果症状持续或加重，请务必及时就医，并携带相关资料咨询医生。\\n\\n请告诉我你的具体情况，我会尽力为你提供建议 🌸\"}]', '2025-10-22 04:24:42', '2025-10-22 04:24:43');
INSERT INTO `conversations` VALUES (13, 1, 'comprehensive', '123253557658', '[{\"role\": \"user\", \"content\": \"123253557658\"}, {\"role\": \"assistant\", \"content\": \"### 卦象推算过程\\n\\n#### 1. 起卦方法\\n- 由于输入内容为单句数字串，采用 **单句起卦规则**：\\n  - **上卦**：句子字数 ÷ 8 取余数，对应先天八卦数。\\n  - **下卦**：当前时辰（假设为 **21:00-00:00**，属 **乾卦**，先天数 **1**）。\\n  - **动爻**：句子字数 + 下卦先天数 ÷ 6 取余数，对应爻位。\\n\\n#### 2. 具体计算\\n- 句子字数：12（数字串长度）\\n- **上卦**：12 ÷ 8 = 1 余 **4** → 对应 **震卦**（☳）。\\n- **下卦**：时辰为乾卦（☰），先天数 **1**。\\n- **动爻**：（12 + 1）÷ 6 = 13 ÷ 6 = 2 余 **1** → 对应 **初爻**（第一爻）。\\n\\n#### 3. 卦象生成\\n- **本卦**：上震下乾 → **䷘ 雷天大壮**。\\n- **变卦**：初爻变动（阳爻变阴爻），上卦震（☳）不变，下卦乾（☰）初爻变阴 → 下卦成 **巽**（☴）。  \\n  变卦为：上震下巽 → **䷟ 雷风恒**。\\n\\n---\\n\\n### 卦象解读\\n\\n#### ䷘ 本卦·雷天大壮\\n- **卦辞**：  \\n  “大壮，利贞。”  \\n  象征强盛壮大，但需坚守正道。雷行天上，气势恢宏，但若过度刚强易折，应持中守正。\\n- **爻辞（初爻）**：  \\n  “壮于趾，征凶，有孚。”  \\n  初爻为动爻，揭示行动始于细微。若急躁冒进（“壮于趾”），恐招致风险；需以诚信（“有孚”）稳根基。\\n\\n#### ䷟ 变卦·雷风恒\\n- **卦辞**：  \\n  “恒，亨，无咎，利贞，利有攸往。”  \\n  雷动风行，象征持久与稳定。持之以恒可获通达，但需顺应规律，不可强求变动。\\n\\n---\\n\\n### 综合启示\\n1. **当前状态（大壮）**：  \\n   数字串的密集排列如雷震于天，显露出强烈的能量或急切意图。但初爻警示：若根基不固（如计划未周、动机未纯），贸然行动可能陷入“征凶”。\\n2. **转变方向（恒）**：  \\n   动爻化巽风，提示需从“强攻”转向“柔韧”。风随雷行，意味持续积累比短暂爆发更重要。如调整节奏、细化步骤，可化冲动为长久之力。\\n3. **关键建议**：  \\n   - 审视动机：数字背后是否隐含过度追求结果？当以“有孚”之心沉淀。  \\n   - 顺势而为：借“恒”卦之力，将分散能量聚焦于可持续的行动中。\\n\\n---\\n\\n### 符号总结\\n- **本卦**：䷘ 雷天大壮（初爻动）  \\n- **变卦**：䷟ 雷风恒  \\n- **动爻**：初爻（阳变阴）  \\n- **核心卦象关联**：  \\n  震雷为动，乾天为健 → 需克制刚猛；  \\n  巽风为入 → 化刚为柔，以恒心破局。\"}, {\"role\": \"user\", \"content\": \"大噶好大噶好的\"}, {\"role\": \"assistant\", \"content\": \"### 卦象推算过程\\n\\n#### 1. 起卦方法\\n- 输入内容为单句\\\"大噶好大噶好的\\\"，采用**单句起卦规则**：\\n  - **上卦**：句子字数 ÷ 8 取余数，对应先天八卦数\\n  - **下卦**：当前时辰（假设为**21:00-00:00**，属**乾卦**，先天数**1**）\\n  - **动爻**：句子字数 + 下卦先天数 ÷ 6 取余数\\n\\n#### 2. 具体计算\\n- 句子字数：6（\\\"大噶好大噶好的\\\"共6字）\\n- **上卦**：6 ÷ 8 = 0 余**6** → 对应**坎卦**（☵）\\n- **下卦**：时辰为乾卦（☰），先天数**1**\\n- **动爻**：（6 + 1）÷ 6 = 7 ÷ 6 = 1 余**1** → 对应**初爻**\\n\\n#### 3. 卦象生成\\n- **本卦**：上坎下乾 → **䷄ 水天需**\\n- **变卦**：初爻变动（阳爻变阴爻），上卦坎（☵）不变，下卦乾（☰）初爻变阴 → 下卦成**巽**（☴）\\n  变卦为：上坎下巽 → **䷻ 水风井**\\n\\n---\\n\\n### 卦象解读\\n\\n#### ䷄ 本卦·水天需\\n- **卦辞**：\\n  \\\"需，有孚，光亨，贞吉，利涉大川。\\\"\\n  水在天上，象征云气聚集，等待时机。需卦强调耐心等待、诚信守正，终能克服险阻。\\n\\n- **爻辞（初爻）**：\\n  \\\"需于郊，利用恒，无咎。\\\"\\n  在郊野等待，保持恒心，可免灾祸。初爻为动爻，提示在初始阶段更需沉稳。\\n\\n#### ䷻ 变卦·水风井\\n- **卦辞**：\\n  \\\"井，改邑不改井，无丧无得，往来井井。\\\"\\n  水上有风，如井水滋养万物。象征稳定持久的资源，虽不显赫却源源不断。\\n\\n---\\n\\n 综合启示\\n\\n1. **当前状态（需卦）**：\\n   重复的问候语\\\"大噶好\\\"如云聚天上，显示友善的社交意图，但需卦提醒：真诚的交往需要时间沉淀，急于求成反失其真。\\n\\n2. **转变方向（井卦）**：\\n   动爻化巽风，提示从\\\"等待认可\\\"转向\\\"滋养关系\\\"。如井水般持续给予关怀，比热烈的问候更能建立深厚联结。\\n\\n3. **社交建议**：\\n   - 保持恒心：初爻\\\"利用恒\\\"——真诚的问候贵在坚持，不在频次\\n   - 深化交流：井卦启示可从小事入手，如记住对方喜好，让关系如井水般自然流淌\\n\\n---\\n\\n### 符号总结\\n- **本卦**：䷄ 水天需（初爻动）\\n- **变卦**：䷻ 水风井\\n- **动爻**：初爻（阳变阴）\\n- **核心卦象关联**：\\n  坎水为险、为隐 → 社交中的不确定性\\n  巽风为入、为顺 → 以柔顺姿态融入群体\"}]', '2025-10-22 04:40:46', '2025-10-22 07:42:16');
INSERT INTO `conversations` VALUES (14, 1, 'ziwei', '这是我的紫微斗数命盘信息：\n【命盘基本信息】\n性别：男\n出生日期：公历2002-06-18（农历二〇...', '[{\"role\": \"user\", \"content\": \"这是我的紫微斗数命盘信息：\\n【命盘基本信息】\\n性别：男\\n出生日期：公历2002-06-18（农历二〇〇二年五月初八）\\n八字：壬午 丙午 丁巳 丙午\\n出生时间：午时（11:00~13:00）\\n星座：双子座，生肖：马\\n命主：贪狼，身主：火星\\n五行局：木三局\\n命宫地支：子，身宫地支：子\\n\\n【十二宫分布】\\n【福德宫】壬寅〔来因宫〕\\n  主星：天机(得)、太阴(旺)\\n  杂曜：截空、蜚廉\\n  长生十二神：临官，博士十二神：小耗\\n  将前十二神：指背，岁前十二神：白虎\\n  大限：23-32岁（壬寅）\\n\\n【田宅宫】癸卯\\n  主星：紫微(旺)〔权〕、贪狼(利)\\n  辅星：天魁\\n  杂曜：天喜、咸池、三台、天德、空亡\\n  长生十二神：帝旺，博士十二神：将军\\n  将前十二神：咸池，岁前十二神：天德\\n  大限：33-42岁（癸卯）\\n\\n【官禄宫】甲辰\\n  主星：巨门(陷)\\n  辅星：文昌(得)\\n  杂曜：天贵、凤阁、寡宿\\n  长生十二神：衰，博士十二神：奏书\\n  将前十二神：月煞，岁前十二神：吊客\\n  大限：43-52岁（甲辰）\\n\\n【仆役宫】乙巳\\n  主星：天相(得)\\n  辅星：天钺、地空、地劫\\n  杂曜：天姚、天巫、破碎、天伤\\n  长生十二神：病，博士十二神：飞廉\\n  将前十二神：亡神，岁前十二神：病符\\n  大限：53-62岁（乙巳）\\n\\n【迁移宫】丙午\\n  主星：天梁(庙)〔禄〕\\n  辅星：右弼\\n  杂曜：天才、天寿、天福、阴煞\\n  长生十二神：死，博士十二神：喜神\\n  将前十二神：将星，岁前十二神：岁建\\n  大限：63-72岁（丙午）\\n\\n【疾厄宫】丁未\\n  主星：廉贞(利)、七杀(庙)\\n  辅星：火星(利)\\n  杂曜：天月、天空、天使\\n  长生十二神：墓，博士十二神：病符\\n  将前十二神：攀鞍，岁前十二神：晦气\\n  大限：73-82岁（丁未）\\n\\n【财帛宫】戊申\\n  主星：天马\\n  辅星：左辅〔科〕\\n  杂曜：封诰、旬空、孤辰\\n  长生十二神：绝，博士十二神：大耗\\n  将前十二神：岁驿，岁前十二神：丧门\\n  大限：83-92岁（戊申）\\n\\n【子女宫】己酉\\n  辅星：铃星(得)\\n  杂曜：红鸾、天厨\\n  长生十二神：胎，博士十二神：伏兵\\n  将前十二神：息神，岁前十二神：贯索\\n  大限：93-102岁（己酉）\\n\\n【夫妻宫】庚戌\\n  主星：天同(平)\\n  辅星：文曲(陷)、陀罗(庙)\\n  杂曜：恩光、龙池、华盖、天官\\n  长生十二神：养，博士十二神：官府\\n  将前十二神：华盖，岁前十二神：官符\\n  大限：103-112岁（庚戌）\\n\\n【兄弟宫】辛亥\\n  主星：武曲(平)〔忌〕、破军(平)、禄存\\n  杂曜：八座、月德\\n  长生十二神：长生，博士十二神：博士\\n  将前十二神：劫煞，岁前十二神：小耗\\n  大限：113-122岁（辛亥）\\n\\n【命宫宫】壬子〔身宫〕\\n  主星：太阳(陷)\\n  辅星：擎羊(陷)\\n  杂曜：解神、台辅、天哭、天虚\\n  长生十二神：沐浴，博士十二神：力士\\n  将前十二神：灾煞，岁前十二神：大耗\\n  大限：3-12岁（壬子）\\n\\n【父母宫】癸丑\\n  主星：天府(庙)\\n  杂曜：天刑\\n  长生十二神：冠带，博士十二神：青龙\\n  将前十二神：天煞，岁前十二神：龙德\\n  大限：13-22岁（癸丑）\\n\\n请帮我分析解读。\"}, {\"role\": \"assistant\", \"content\": \"（轻轻推了推眼镜，手指在命盘上缓缓划过）哎呀，这个盘很有意思啊！让我先泡杯菊花茶——你这火气太旺了，我嗓子都跟着发干。（端起茶杯抿了一口）咱们先看八字根基：**丁火日主坐巳火，三丙午火围攻，壬水正官虚浮**，典型的「炎上格」啊！就像正午的太阳悬在赤道上空，连云彩都被烤化了。（突然凑近屏幕）不过你这格局妙就妙在——**火越旺反而越要顺其势**，强行补水只会激怒火神！\\n\\n### 🔥 双系统战略诊断（八字×紫微互参）\\n#### 1️⃣ **命宫核心矛盾**（八字火炎土燥 × 紫微太阳陷+擎羊）\\n- **八字视角**：丁火被三丙午火「烘烤」，急需木来泄火生财（但原局缺木！）\\n- **紫微印证**：太阳在子「日落扶桑」本主困顿，但**擎羊激发太阳潜能**——就像沙漠里的太阳能板，越暴晒发电越猛！\\n- **呆彬解码**：你天生是「高压锅型」人才，别人30℃就蔫了，你40℃反而沸腾。但要注意：**2025乙巳年（23岁）将触发「木火通明」契机**，现在必须提前储备专业技能！\\n\\n#### 2️⃣ **人生主赛道定位**（福德宫天机太阴 × 八字喜神）\\n| 维度        | 福德宫天机太阴（壬寅） | 八字喜用神 |\\n|-------------|------------------------|------------|\\n| **能量特质** | 思维如月光般流动（天机+太阴） | 需补木火   |\\n| **致命短板** | 截空+蜚廉导致过度内耗   | 木气不足   |\\n| **呆彬点睛** | ✅ **把「多思」转为「智库」**：<br>• 23-32岁大限在福德宫，**做知识产品经理**（如法律/医疗科普）<br>• 每天用「番茄工作法」切割思考时间，避免思维漩涡 |\\n\\n#### 3️⃣ **财富破局点**（财帛宫天马+左辅科 × 火炎土燥）\\n（突然拍桌）看这里！财帛宫**天马+左辅科**像不像两匹汗血宝马？但八字火旺无水，**财路必须「动中求」**：\\n- ✦ **最佳路径**：2026丙午年（24岁）天梁化禄入迁移宫，**跨境教育/中医海外推广**是黄金赛道\\n- ✦ **致命陷阱**：夫妻宫天同+陀罗，30岁前别碰合伙投资（陀罗暗藏三角债务风险！）\\n\\n### 🌿 中医维度预警（倪海厦心法应用）\\n（掏出脉枕比划）你这盘面火气直冲百会：\\n```mermaid\\ngraph LR\\nA[八字三丙午火] --> B(心火亢盛)\\nB --> C{紫微疾厄宫廉贞七杀+火星}\\nC --> D[舌疮/失眠]\\nC --> E[甲亢倾向]\\nD --> F[每日辰时敲胆经]\\nE --> G[戌时跪坐15分钟]\\n```\\n**呆彬药膳方**：  \\n▫️ 午时喝「竹叶石膏汤」（淡竹叶3g+生石膏10g）  \\n▫️ 睡前用「吴茱萸粉」敷涌泉穴（引火归元）  \\n\\n### 🚀 2025关键行动指南\\n1. **3月惊蛰前**：在书房**东南方**放文昌塔（补木气），每天申时（15-17点）背诵《黄帝内经》素问篇  \\n2. **7月小暑**：迁移宫天梁化禄启动，**考取国际中医师证**（比国内证书更利发展）  \\n3. **9月白露**：田宅宫紫微贪狼被引动，**合资租工作室**（避免独自承担租金）  \\n\\n（突然压低声音）最后说个秘密：你父母宫天府庙却无辅星，**父亲可能从事金融但2026年有职业转折**。现在多给妈妈发养生文章，她是你未来十年的贵人！（推回眼镜）这盘最妙的是——**火旺到极致反而淬炼出真金**，33岁紫微贪狼大限启动时，你就是跨境中医界的「火凤凰」啊！  \\n\\n> 呆彬补刀：  \\n> ✦ 忌穿黑色（激化火水相战）  \\n> ✦ 每月农历初八做「木火通明」冥想（观想自己化作青烟升腾）  \\n> ✦ 现在立刻！把手机壁纸换成**故宫红墙+竹林**（木火相生视觉锚点）  \\n\\n（茶杯见底，指尖敲着命盘）说吧兄弟，你最想先突破哪个领域？事业？健康？还是...（挑眉笑）那个总让你失眠的桃花劫？\"}]', '2025-10-22 07:43:21', '2025-10-22 07:43:21');

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `session_token`(`session_token` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_sessions
-- ----------------------------
INSERT INTO `user_sessions` VALUES (1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiMTUzODI3MjgzNzgiLCJpYXQiOjE3NjExMDA1OTIsImV4cCI6MTc2MTcwNTM5Mn0.fCOi857k9jSmzhAkTHL7trmeB3X-XT_8PC0jdcNPrmI', '2025-10-29 10:36:33', '2025-10-22 02:36:32');
INSERT INTO `user_sessions` VALUES (2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDIyNTMsImV4cCI6MTc2MTcwNzA1M30.CQWxyOeFrkIsUSpoVg27CsNYvYJON6XPh5hidLhF2zU', '2025-10-29 11:04:14', '2025-10-22 03:04:13');
INSERT INTO `user_sessions` VALUES (3, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDIzMzIsImV4cCI6MTc2MTcwNzEzMn0.gQoP2P62nMs_p5rRWAbvY4nivIk6Y9tvNu6x23sKmf8', '2025-10-29 11:05:33', '2025-10-22 03:05:32');
INSERT INTO `user_sessions` VALUES (4, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDI4ODUsImV4cCI6MTc2MTcwNzY4NX0.5WzaXj6ny5pMUPatuOtSyFFS2n7hrcuFjJT2xZ35-lc', '2025-10-29 11:14:45', '2025-10-22 03:14:45');
INSERT INTO `user_sessions` VALUES (5, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDI5MTksImV4cCI6MTc2MTcwNzcxOX0.r8f6XLQ7VQkB1nLIY_2lOImLkMqzNSnTznoLUz-bY6c', '2025-10-29 11:15:20', '2025-10-22 03:15:19');
INSERT INTO `user_sessions` VALUES (6, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMwOTksImV4cCI6MTc2MTcwNzg5OX0.ItFf6KjV0LmLyxVVv-wLJAnaIEphdMAfz9B0tcQ299U', '2025-10-29 11:18:20', '2025-10-22 03:18:19');
INSERT INTO `user_sessions` VALUES (7, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMxNjEsImV4cCI6MTc2MTcwNzk2MX0.UrE7S2ACa-NtSz24K0tjW-FVm85Y2gXofqzadFl7B8A', '2025-10-29 11:19:21', '2025-10-22 03:19:21');
INSERT INTO `user_sessions` VALUES (8, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMyNTEsImV4cCI6MTc2MTcwODA1MX0.3E1N-m_L0zKJfA6VW2Fe-_XIcyJLuOQc8gyIYlp16qs', '2025-10-29 11:20:52', '2025-10-22 03:20:51');
INSERT INTO `user_sessions` VALUES (9, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMyODQsImV4cCI6MTc2MTcwODA4NH0.8JrTW1e06THPd9ihWkBr2FkxeP3G8PaUKjv9aDhcDiM', '2025-10-29 11:21:25', '2025-10-22 03:21:24');
INSERT INTO `user_sessions` VALUES (10, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMyOTYsImV4cCI6MTc2MTcwODA5Nn0.QntMQxI6Qy8qPGGrDcgSMd1RjA9qkLcBEgt7kI7YWFg', '2025-10-29 11:21:36', '2025-10-22 03:21:36');
INSERT INTO `user_sessions` VALUES (11, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDMzODksImV4cCI6MTc2MTcwODE4OX0.cDkL4_-JkUSOb83bu9rn-KLbD0Bu_Ad-xhH62zyV7G4', '2025-10-29 11:23:09', '2025-10-22 03:23:09');
INSERT INTO `user_sessions` VALUES (12, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDM0NzEsImV4cCI6MTc2MTcwODI3MX0.OaMsBuZV4UWPS5utZsIKpga_WUM_IXxBVgJOGqOGck8', '2025-10-29 11:24:31', '2025-10-22 03:24:31');
INSERT INTO `user_sessions` VALUES (13, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDM0OTgsImV4cCI6MTc2MTcwODI5OH0.Vsp9j60p5abj9pokEeE4vV5mz-ugmfFZld71M3pDM4w', '2025-10-29 11:24:59', '2025-10-22 03:24:58');
INSERT INTO `user_sessions` VALUES (14, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDM1NTMsImV4cCI6MTc2MTcwODM1M30.eM49n153Y3IXUQDB_6ZoGZbudn58MQHsbg8cqa_Jnfg', '2025-10-29 11:25:53', '2025-10-22 03:25:53');
INSERT INTO `user_sessions` VALUES (15, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDQwMjEsImV4cCI6MTc2MTcwODgyMX0.KvvbxGb1Fc9Jb67hn3RO3Lic6Lxaokpj8DbwivrHicY', '2025-10-29 11:33:42', '2025-10-22 03:33:41');
INSERT INTO `user_sessions` VALUES (16, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDQwODYsImV4cCI6MTc2MTcwODg4Nn0.TGNs9GvvrSmwt_xBKba0IClr-IflP0nHxyQ7XUEGbzU', '2025-10-29 11:34:46', '2025-10-22 03:34:46');
INSERT INTO `user_sessions` VALUES (17, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDQ4NDUsImV4cCI6MTc2MTcwOTY0NX0.6GT89HW9lv0gm3vGsYfmhkUWZOsy3Rb4T1j6cdTJI5U', '2025-10-29 11:47:26', '2025-10-22 03:47:25');
INSERT INTO `user_sessions` VALUES (18, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDUxNjIsImV4cCI6MTc2MTcwOTk2Mn0.5aJUJ-mpV8etZmiVNsBgKaReMAHXABgUCGSNdfvVD-s', '2025-10-29 11:52:42', '2025-10-22 03:52:42');
INSERT INTO `user_sessions` VALUES (19, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDUxNzYsImV4cCI6MTc2MTcwOTk3Nn0.KZuNyGiujNwetBLMxxU7rkzfWxnGHSdnR7dFHTt9pyM', '2025-10-29 11:52:57', '2025-10-22 03:52:56');
INSERT INTO `user_sessions` VALUES (20, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDU1MTYsImV4cCI6MTc2MTcxMDMxNn0.ogEg5YMJhamBZNUDYuDCBiDLjB9T7G7TYsMe3Ftj0RM', '2025-10-29 11:58:36', '2025-10-22 03:58:36');
INSERT INTO `user_sessions` VALUES (21, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDU1MzAsImV4cCI6MTc2MTcxMDMzMH0.YpMILjDqhPxig9NNFdekzbW9Yq4L_jmDGEydKdn1WpU', '2025-10-29 11:58:51', '2025-10-22 03:58:50');
INSERT INTO `user_sessions` VALUES (22, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDU4NjcsImV4cCI6MTc2MTcxMDY2N30.-zFSPtCQp_zRFjnvHZvO-3_tIu7kfwTMGqxCbKOGr2Y', '2025-10-29 12:04:28', '2025-10-22 04:04:27');
INSERT INTO `user_sessions` VALUES (24, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDYzOTMsImV4cCI6MTc2MTcxMTE5M30.rintMWz3ZXghteAYodqERz717qIIbUznCjnpTCbbOKE', '2025-10-29 12:13:14', '2025-10-22 04:13:13');
INSERT INTO `user_sessions` VALUES (25, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDY0MTcsImV4cCI6MTc2MTcxMTIxN30.lZt9uBxyfGtdTBStCCh8t-w2y3oe5oLDDiHJqasO2iU', '2025-10-29 12:13:37', '2025-10-22 04:13:37');
INSERT INTO `user_sessions` VALUES (26, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInBob25lIjoiMTM4MDAwMDAwMDIiLCJpYXQiOjE3NjExMDcwNjUsImV4cCI6MTc2MTcxMTg2NX0.f8EsStPdYMt8Lf4TG7rbKEynCl22dRe00ipVrB6ysm8', '2025-10-29 12:24:25', '2025-10-22 04:24:25');
INSERT INTO `user_sessions` VALUES (27, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiMTUzODI3MjgzNzgiLCJpYXQiOjE3NjExMjAzNTQsImV4cCI6MTc2MTcyNTE1NH0.8K7Lg8VU5s-GMNlqEQ2jas_DkU3-QC1BrBcEyW32hgU', '2025-10-29 16:05:55', '2025-10-22 08:05:54');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birthday` datetime NULL DEFAULT NULL COMMENT '生日（精确到时分）',
  `bazi_text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '八字信息长文本',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `phone`(`phone` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '485913144@qq.com', '15382728378', '$2b$12$83/c7jNKl.6LqE39JdUKa.oXDir/hYrEDLnnk7.tH.ijNxLS2o5z6', NULL, NULL, NULL, '2025-10-22 02:36:31', '2025-10-22 08:05:54', '2025-10-22 08:05:54', 1);
INSERT INTO `users` VALUES (2, 'testuser', '13800000002', '$2b$12$b/R3mHVYDlS0HDuvN.PCAeN3FpKmjz0cJLnkMVAnn7yF4nIdGAFJK', NULL, NULL, NULL, '2025-10-22 03:04:13', '2025-10-22 04:24:25', '2025-10-22 04:24:25', 1);

SET FOREIGN_KEY_CHECKS = 1;
