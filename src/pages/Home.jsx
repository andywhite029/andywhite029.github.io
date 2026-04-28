import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Tag } from 'lucide-react'
import PhotoWall from '../components/PhotoWall'
import Footer from '../components/Footer'

const skills = [
  { name: '品牌传播与舆情公关', level: 90 },
  { name: '多平台媒体运营', level: 90 },
  { name: '会展活动策划执行', level: 85 },
  { name: '摄影摄像与新闻采编', level: 85 },
  { name: 'AI 工具应用开发', level: 75 },
]

const timeline = [
  {
    year: '2026.3-至今',
    title: '品牌公关传播实习生',
    company: '轻舟智航',
    desc: '独立负责小红书运营，3天涨粉500+；更新搭建官网；参与北京车展、智能电动汽车论坛',
  },
  {
    year: '2025.9-2026.3',
    title: 'Marketing & PR Intern',
    company: 'Momenta',
    desc: '运营知乎、B站、微信公众号，累计发布100+篇稿件；孵化10+高质量KOC账号；参与WICV展会、广州车展获3000万曝光',
  },
  {
    year: '2025.3-2025.8',
    title: '市场实习生',
    company: '极氪汽车',
    desc: '负责用户增长策略，新增注册用户8万+；策划执行20+场线下活动，五一车展单日最高获客5000+；垂媒订单增长500%',
  },
  {
    year: '2024.12-2025.2',
    title: '实习销售',
    company: '小米之家',
    desc: '国家补贴期间单日最高成交20+单，成交额2万+；负责库存盘点与产品陈列设计',
  },
  {
    year: '2024.1-2024.3',
    title: '摄影记者',
    company: '陕西省电视台',
    desc: '完成新闻选题策划、拍摄采访与稿件撰写；参与"专精特新小巨人企业"系列报道，完成10+篇采编报道',
  },
  {
    year: '2022-2026',
    title: '本科生',
    company: '西北大学',
    desc: '新闻传播学院 · 网络与新媒体专业',
  },
]

const projects = [
  {
    title: 'Momenta曹旭东参加2025世界智能网联汽车大会并分享实践经验',
    desc: '10月16日，2025世界智能网联汽车大会（WICV）在北京隆重开幕，Momenta作为智能驾驶领域领先企业受邀出席。',
    tags: ['品牌传播', '会展活动', '智能驾驶'],
    image: '/photos/momenta-wicv.webp',
    link: 'https://mp.weixin.qq.com/s/cLbORjSdNRzwEKDKHAQ3vQ',
  },
  {
    title: '轻舟智航2026北京车展《Quest with AI，Craft the future》发布会',
    desc: '北京车展首日：轻舟智航物理AI模型亮相，发布超500TOPS智驾对标上千TOPS体验',
    tags: ['品牌传播', '会展活动', '智能驾驶'],
    image: '/photos/qcraft-autoshow.webp',
    link: 'https://mp.weixin.qq.com/s/8JVTkqS7IDftY-OBNxotPA',
  },
]

const blogPosts = [
  {
    id: 1,
    title: '类型学摄影在当代中国的创新与发展路径研究',
    excerpt: '本文梳理类型学摄影的起源与发展脉络、杜塞尔多夫学派的影响以及中国本土化探索历程，探讨其在当代中国的发展现状与创新路径。研究发现，类型学摄影的核心价值在于运用标准化视觉语言构建对特定对象的结构性认知。在AI时代，该方法正经历从客观记录工具向文化批判媒介的转型。',
    date: '2026-04-27',
    readTime: 15,
    tags: ['论文'],
    link: '#',
  },
  {
    id: 2,
    title: '新春走基层 | 火箭发动机试车准备 这样做',
    excerpt: '火箭发动机在正式"上岗"之前，要经过点火试验测试各项性能，这个过程被称为"试车"。每一次试车的时间短不过几秒，长则上千秒，在熊熊火焰喷薄而出的一瞬间的背后，是无数航天人默默奉献的身影，他们秉持"一次就把事情做对做好"的理念，做足试车的各项准备。',
    date: '2024-02-24',
    readTime: 5,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10493211',
  },
  {
    id: 3,
    title: '温暖回家路 | 打包思念 回家过年',
    excerpt: '临近新春，记者来到西安市纺织城客运站，记录下在外打拼的游子们回家过年的感人瞬间。近12年未见到出嫁女儿的刘女士专程带了四大箱苹果给女儿；父母去世后好几年没回老家的张先生带上四川朋友手工做的腊肉和丑橘准备与亲友团聚；餐厅打工的刘女士收到老板赠送的年货，表示要回去陪妈妈吃团圆饭。',
    date: '2024-02-08',
    readTime: 6,
   tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10489453',
  },
  {
    id: 4,
    title: '温暖回家路 | 把"年味"藏在行李箱里带回家',
    excerpt: '火车站是归乡的中转站。记者在西安火车站见到即将返回韩城的侯女士，她的四个大袋里装满鸡鸭鱼肉和年货，为留守在家的孩子准备团圆饭。在西安做餐饮生意的姚女士已五六年没回家过年，今年特意带新鲜肉菜回家招待亲戚。70岁的张先生带着陕西特产熟牛肉、干馍片，准备送给五湖四海的驴友今年相约广东旅游过年。',
    date: '2024-02-07',
    readTime: 4,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10489404',
  },
  {
    id: 5,
    title: '新春走基层 站好试车"第一班岗"',
    excerpt: '火箭发动机在正式"上岗"前，要经过点火试验测试各项性能，这个过程被称为"试车"。航天科技集团六院165所的杨战伟和同事们负责拆装发动机的工作，是试车台上最基础的"第一班岗"。他们自制操作平台、优化转运工具，将发动机安装效率提升三小时，以零事故的高效能完成了2023年百台次试车任务。',
    date: '2024-02-24',
    readTime: 10,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10486784',
  },
  {
    id: 6,
    title: '探寻新质生产力 | 西安：医疗器械研发 借力"人工智能"',
    excerpt: '西安市鄠邑区的西安汇智医疗集团有限公司研发生产了一批智能化的医疗器械，填补了国内多项空白。公司产品包括智能护理系统、呼吸同步雾化系统、智能吸氧系统等，可实现对病患的智能化监测、远程监视和数据管理。公司副总经理阮东耀表示，今后企业会将医院智能护理作为主攻方向。',
    date: '2024-03-14',
    readTime: 5,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10486767',
  },
  {
    id: 7,
    title: '"福"字带回家 欢喜迎新春',
    excerpt: '春节将至，位于西安城墙西北角的广仁寺，游人络绎不绝。不少游客穿着汉服打卡拍照。从这里离开的人们，人手一张挂历，有的还拿着墨迹未干的"福"字，红纸黑墨中汇集着大家的新年祝福和愿望。临近春节，每天早上8点到下午5点半，西安广仁寺都会免费为游客分发小礼物。',
    date: '2024-01-30',
    readTime: 4,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10484818',
  },
  {
    id: 8,
    title: '新春走基层 | 建设中的西安东站',
    excerpt: '西安东站是西北地区特大型铁路综合交通枢纽，目前正在建设中，广泛采用绿色节能技术，站房屋顶和雨棚安装光伏发电系统。站房总面积达10万平方米，相当于14个标准足球场面积，计划2025年底全面建成，届时西安至武汉、重庆通行时间将从5-6小时缩短至2.5小时。',
    date: '2024-01-21',
    readTime: 5,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10482946',
  },
  {
    id: 9,
    title: '"高质量发展一线行"专访 | 牢记"国之大者" 当好秦岭卫士',
    excerpt: '专访陕西省林业局局长郑钟，聚焦秦岭生态保护成就。秦岭森林覆盖率达82%，建立116处自然保护区总面积9200平方公里。2023年人工繁殖大熊猫创纪录，繁育4胎7仔；朱鹮种群从7只增长到全球1万余只；5000年以上古树实施特殊保护。',
    date: '2024-01-19',
    readTime: 6,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10482930',
  },
  {
    id: 10,
    title: '探访正在"崛起"的西安东站',
    excerpt: '西安东站是西北地区特大型铁路综合交通枢纽，计划2025年底全面建成，届时西安至武汉、重庆通行时间将从5-6小时缩短至2.5小时，年发送旅客量预计达3650万人次。站房总面积达10万平方米，采用光伏发电等绿色节能技术，集高铁、普铁、地铁、公交于一体。',
    date: '2024-01-21',
    readTime: 4,
    tags: ['新闻'],
    link: 'https://qidian.sxtvs.com/timing/share/content/10482517',
  },
]

const allTags = ['全部', ...new Set(blogPosts.flatMap((p) => p.tags))]

function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`bg-bg-primary/70 backdrop-blur-md rounded-3xl border border-border/50 shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [selectedTag, setSelectedTag] = useState('全部')
  const [showAll, setShowAll] = useState(false)

  const filteredPosts =
    selectedTag === '全部'
      ? blogPosts
      : blogPosts.filter((p) => p.tags.includes(selectedTag))

  const displayedPosts = showAll ? filteredPosts : filteredPosts.slice(0, 5)
  const hasMore = filteredPosts.length > 5

  return (
    <div className="min-h-screen">
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <PhotoWall />
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 lg:p-16">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-text-secondary font-medium tracking-widest uppercase text-sm mb-6"
              >
                wellcome to my world
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-8"
              >
                在影像与文字之间
                <br />
                <span className="text-accent">寻找意义</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
              >
                我是Andy，一名热爱技术的创作者。这里记录着我的思考与生活。<br />
                期待与你相遇。
              </motion.p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-8">
                关于我
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                在品牌传播与舆情公关方面有丰富实战经验，有策划与执行线下会展商业活动经历，能够高效协同多方资源推动项目落地。
                 <br />擅长摄影摄像，熟悉影视制作流程，有多平台媒体运营、用户增长策略、紧急舆情公关经验。
                 <br />熟悉各种 AI 工具，使用 Cursor、Gemini 等工具独立制作网页、安卓 APP（代码见作品集），以及各类图文音频生成式 AI。
              </p>

              <h3 className="font-serif text-xl font-bold text-text-primary mb-6">
                技能特长
              </h3>
              <div className="space-y-4 mb-8">
                {skills.map((skill, index) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-text-primary font-medium">{skill.name}</span>
                      <span className="text-text-secondary">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-8 md:p-12">
              <h3 className="font-serif text-xl font-bold text-text-primary mb-6">
                经历
              </h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 border-b border-border/30 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-16 text-accent font-mono font-medium">
                      {item.year}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-primary mb-1">
                        {item.company}
                      </h4>
                      <p className="text-text-secondary mb-1">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="portfolio" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
                项目实践
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                这里是我近年来的一些项目实践，涵盖从市场公关到软件代码的各类应用。
              </p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.article
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a href={project.link || '#'} target="_blank" rel="noopener noreferrer">
                    <GlassCard className="overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-border to-bg-secondary flex items-center justify-center overflow-hidden">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-serif text-text-secondary/30">
                            {project.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors mb-2">
                          {project.title}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4">{project.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-bg-secondary border border-border/50 rounded-full text-xs text-text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </a>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="blog" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
                博客
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                关于技术、设计与生活的思考。
              </p>

              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-secondary hover:bg-border'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                    <GlassCard className="p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {post.readTime} 分钟
                          </span>
                        </div>
                        {post.link !== '#' && (
                          <span className="text-xs text-accent">阅读原文 →</span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3">
                        {post.title}
                      </h3>
                      <p className="text-text-secondary mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </a>
                </motion.article>
              ))}

              {hasMore && (
                <div className="col-span-1 md:col-span-2 flex justify-center pt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-3 bg-bg-secondary hover:bg-border text-text-primary rounded-full transition-colors"
                  >
                    {showAll ? '收起' : `查看更多 (${filteredPosts.length - 5})`}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
