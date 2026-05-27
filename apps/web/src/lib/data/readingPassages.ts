import type { ReadingPassage } from '../types'

export const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'rp-001',
    title: 'The Rise of Urban Farming',
    topic: 'Environment & Society',
    source: 'Ikhora Content Team',
    cefrLevel: 'B2',
    wordCount: 420,
    timeLimitMinutes: 20,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-10T08:00:00Z',
    text: `Urban farming — the practice of growing food within city boundaries — has undergone a remarkable transformation in recent decades. Once considered a fringe activity associated with allotment gardens and rooftop experiments, it has emerged as a serious response to some of the most pressing challenges facing modern cities.

The appeal of urban agriculture is multifaceted. At its most basic level, it offers residents access to fresh, locally produced food, reducing dependence on long and often environmentally costly supply chains. A head of lettuce grown on a city rooftop requires none of the refrigerated transport, packaging, or extensive warehousing that characterise conventional food distribution. Studies conducted in several North American and European cities have shown that urban farms can supply meaningful proportions of a neighbourhood's vegetable requirements, particularly for leafy greens and herbs.

Beyond the direct food production benefits, urban farms have demonstrated significant social value. Community gardens, in particular, have been shown to foster social cohesion in areas that might otherwise be characterised by anonymity and isolation. Residents working alongside one another to tend shared plots report stronger neighbourhood connections. Several municipal governments have incorporated community gardening schemes into their public health strategies, recognising links between participation in communal growing activities and improved mental wellbeing.

Environmental benefits also feature prominently in arguments for urban agriculture. Green roofs reduce the urban heat island effect, absorbing sunlight that would otherwise heat hard surfaces and contribute to rising city temperatures. They also manage stormwater more effectively than conventional roofing, reducing the burden on urban drainage systems during heavy rainfall events.

Critics, however, raise legitimate concerns. Urban land is expensive, and the economics of small-scale farming rarely make commercial sense without subsidy or a premium market. Furthermore, questions have been raised about soil contamination in cities, where industrial legacy may render growing in-ground produce potentially hazardous. Hydroponic and aeroponic systems — which grow plants without soil — offer a partial solution, but require significant initial investment.

Despite these challenges, city planners in Singapore, Amsterdam, and Detroit are increasingly integrating food production into their urban development strategies, signalling a broader recognition that sustainable cities of the future may need to feed themselves.`,
    questions: [
      { id: 'rp-001-q1', type: 'true_false_not_given', question: 'Urban farming was once regarded as a mainstream activity in most cities.', correctAnswer: 'False', explanation: 'The passage states it was "once considered a fringe activity".', marks: 1 },
      { id: 'rp-001-q2', type: 'true_false_not_given', question: 'A head of lettuce grown in a city requires no refrigerated transport.', correctAnswer: 'True', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-001-q3', type: 'true_false_not_given', question: 'Community gardens have been proven to eliminate social isolation in all cities.', correctAnswer: 'Not Given', explanation: 'The passage describes benefits but makes no absolute claim about elimination.', marks: 1 },
      { id: 'rp-001-q4', type: 'mcq', question: 'Which of the following is NOT mentioned as a benefit of urban farming?', options: ['Reducing reliance on long supply chains', 'Improving residents\' mental wellbeing', 'Generating significant commercial profit', 'Managing stormwater during heavy rain'], correctAnswer: 'Generating significant commercial profit', explanation: 'The passage states commercial economics rarely make sense without subsidy.', marks: 1 },
      { id: 'rp-001-q5', type: 'mcq', question: 'What problem do hydroponic and aeroponic systems primarily address?', options: ['The cost of urban land', 'Soil contamination in cities', 'The urban heat island effect', 'Stormwater management'], correctAnswer: 'Soil contamination in cities', explanation: 'The passage states these systems offer a partial solution to soil contamination concerns.', marks: 1 },
      { id: 'rp-001-q6', type: 'short_answer', question: 'Name TWO cities mentioned as integrating food production into urban planning.', correctAnswer: 'Singapore, Amsterdam, Detroit (any two)', explanation: 'The passage names Singapore, Amsterdam, and Detroit.', marks: 2 },
      { id: 'rp-001-q7', type: 'sentence_completion', question: 'Green roofs help reduce the urban ________ ________ effect.', correctAnswer: 'heat island', explanation: 'Directly stated in the passage.', marks: 1 },
    ],
  },
  {
    id: 'rp-002',
    title: 'The Psychology of Decision-Making',
    topic: 'Psychology & Behaviour',
    source: 'Ikhora Content Team',
    cefrLevel: 'C1',
    wordCount: 390,
    timeLimitMinutes: 22,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-15T08:00:00Z',
    text: `For much of the twentieth century, economists and social scientists operated under the assumption that human beings were fundamentally rational agents: individuals who weighed up the costs and benefits of any given choice and selected the option that maximised their personal utility. This model — the so-called rational actor — underpinned decades of economic policy and business strategy.

The emergence of behavioural economics, pioneered by researchers including Daniel Kahneman and Amos Tversky, fundamentally challenged this assumption. Their work revealed systematic biases in human cognition that cause people to make decisions in ways that deviate significantly from what rational choice theory would predict.

One of the most well-documented phenomena is loss aversion — the tendency for people to feel the pain of losing something approximately twice as intensely as the pleasure of gaining something of equivalent value. This asymmetry has profound practical implications. It helps explain why people hold on to underperforming financial investments longer than is rational, or why they refuse to switch insurance providers even when doing so would save them money: the potential loss feels disproportionately threatening.

A related concept is the status quo bias — the preference for the current state of affairs over alternatives, even when change would be objectively beneficial. Studies have shown that simply changing the default option (for example, making organ donation opt-out rather than opt-in) can dramatically shift collective behaviour without any change in the underlying rules.

Anchoring is another pervasive cognitive bias. When people are exposed to an initial piece of numerical information — even an arbitrary one — they tend to adjust insufficiently away from it when making subsequent estimates. Negotiators often find that the first figure mentioned in a salary discussion anchors the entire negotiation.

These insights have given rise to nudge theory, which argues that governments and organisations can guide people towards better decisions by carefully designing the choice environment — without removing freedom of choice. Applications range from pension enrolment to healthy eating initiatives to energy conservation programmes.`,
    questions: [
      { id: 'rp-002-q1', type: 'true_false_not_given', question: 'The rational actor model assumed people always make objectively correct decisions.', correctAnswer: 'Not Given', explanation: 'The passage says people were assumed to maximise utility, but not that decisions were always correct.', marks: 1 },
      { id: 'rp-002-q2', type: 'true_false_not_given', question: 'Kahneman and Tversky were pioneers in the field of behavioural economics.', correctAnswer: 'True', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-002-q3', type: 'mcq', question: 'According to the passage, loss aversion means that:', options: ['People experience gain and loss equally', 'People feel losses approximately twice as strongly as equivalent gains', 'People avoid all risks in financial decisions', 'People prefer losses to making decisions'], correctAnswer: 'People feel losses approximately twice as strongly as equivalent gains', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-002-q4', type: 'sentence_completion', question: 'The status quo bias refers to people\'s preference for their ________ state of affairs.', correctAnswer: 'current', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-002-q5', type: 'short_answer', question: 'What practical example of changing a default option is given in the passage?', correctAnswer: 'Making organ donation opt-out rather than opt-in', explanation: 'Directly stated in the passage.', marks: 2 },
    ],
  },
  {
    id: 'rp-003',
    title: 'Artificial Intelligence in Healthcare',
    topic: 'Technology & Medicine',
    source: 'Ikhora Content Team',
    cefrLevel: 'B2',
    wordCount: 350,
    timeLimitMinutes: 18,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-20T08:00:00Z',
    text: `Artificial intelligence is beginning to reshape medicine in ways that would have seemed implausible a generation ago. From diagnosing eye disease to predicting patient deterioration in hospital wards, machine learning systems are demonstrating capabilities that in some narrow domains match or exceed those of experienced clinicians.

The most immediate applications are in medical imaging. Algorithms trained on millions of labelled scans have shown remarkable accuracy in identifying cancers, diabetic retinopathy, and cardiovascular abnormalities. In controlled trials, some AI systems have detected early-stage lung cancer in chest X-rays with greater sensitivity than radiologists working without the technology. The potential to extend specialist-level diagnostic capability to under-resourced healthcare settings is particularly significant.

However, enthusiasm must be tempered by a recognition of current limitations. Most AI diagnostic tools are trained on data from specific healthcare systems and patient populations, raising concerns about how well they generalise to different demographics and imaging equipment. A system trained predominantly on scans from European hospitals may perform less well when applied to patients in sub-Saharan Africa or Southeast Asia.

Regulatory frameworks are also struggling to keep pace. Medical devices are subject to rigorous approval processes, but AI software presents novel challenges: an algorithm may continuously improve as it is exposed to new data, making the concept of a fixed, approved version difficult to maintain.

Despite these challenges, investment in healthcare AI continues to grow. The prospect of earlier diagnoses, reduced errors, and more personalised treatment plans represents a compelling incentive for health systems navigating rising demand and constrained resources.`,
    questions: [
      { id: 'rp-003-q1', type: 'true_false_not_given', question: 'AI systems have completely replaced radiologists in diagnosing lung cancer.', correctAnswer: 'False', explanation: 'The passage describes AI as performing better without the technology, implying it augments rather than replaces.', marks: 1 },
      { id: 'rp-003-q2', type: 'mcq', question: 'What specific concern is raised about AI diagnostic tools trained on data from specific healthcare systems?', options: ['They are too expensive to develop', 'They may not perform well across different populations', 'They cannot be updated after approval', 'They are inaccurate in all settings'], correctAnswer: 'They may not perform well across different populations', explanation: 'The passage explicitly raises this concern about generalisation.', marks: 1 },
      { id: 'rp-003-q3', type: 'short_answer', question: 'What challenge does continuously improving AI software create for regulators?', correctAnswer: 'It makes the concept of a fixed, approved version difficult to maintain', explanation: 'Directly stated in the passage.', marks: 2 },
    ],
  },
  {
    id: 'rp-004',
    title: 'The Global Decline of Insects',
    topic: 'Environment & Science',
    source: 'Ikhora Content Team',
    cefrLevel: 'C1',
    wordCount: 410,
    timeLimitMinutes: 22,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-02-01T08:00:00Z',
    text: `Insects are in crisis. A growing body of research, drawing on long-term datasets from Europe, North America, and parts of Asia, has documented dramatic declines in both the abundance and diversity of insect populations. Some studies suggest that the total biomass of flying insects in certain regions has fallen by more than 75 percent over the past three decades — a statistic that has alarmed ecologists worldwide.

The causes are multiple and interconnected. Agricultural intensification is considered the primary driver. The expansion of monoculture farming, combined with the widespread use of pesticides — in particular neonicotinoids, which affect the nervous systems of insects — has drastically reduced the habitats and food sources available to many species. The transformation of field margins, hedgerows, and meadows into productive farmland has eliminated the ecological corridors that insects depend on for migration, reproduction, and shelter.

Artificial light at night represents a less-discussed but increasingly recognised threat. Many insects, particularly moths, navigate using celestial light. Artificial lighting disrupts this behaviour, causing insects to circle light sources rather than fulfil their ecological functions. Research has shown that areas with high levels of light pollution have significantly lower insect populations than comparable dark areas.

Climate change adds further complexity. While warming temperatures may benefit some species by expanding their range, they simultaneously put others under thermal stress, disrupt the synchronisation between insect emergence and the flowering of plants they depend on, and accelerate the spread of parasites and pathogens.

The consequences of sustained insect decline are potentially catastrophic. Insects are fundamental to almost every terrestrial ecosystem: they pollinate approximately 75 percent of the world's flowering plants and crop species, decompose organic matter, and form the base of food chains that sustain birds, bats, amphibians, and fish. A world with significantly fewer insects would be a world with significantly less biodiversity — and would struggle to feed its human population.`,
    questions: [
      { id: 'rp-004-q1', type: 'true_false_not_given', question: 'Total flying insect biomass has fallen by more than 75% in certain regions over three decades.', correctAnswer: 'True', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-004-q2', type: 'true_false_not_given', question: 'Neonicotinoids affect the reproductive systems of insects.', correctAnswer: 'False', explanation: 'The passage states they affect the nervous systems of insects.', marks: 1 },
      { id: 'rp-004-q3', type: 'true_false_not_given', question: 'All insects are negatively affected by rising temperatures.', correctAnswer: 'False', explanation: 'The passage states warming temperatures may benefit some species by expanding their range.', marks: 1 },
      { id: 'rp-004-q4', type: 'mcq', question: 'According to the passage, how do moths primarily navigate?', options: ['Using magnetic fields', 'Using celestial light', 'Using echolocation', 'Using chemical scent trails'], correctAnswer: 'Using celestial light', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-004-q5', type: 'mcq', question: 'What percentage of the world\'s flowering plants and crop species are pollinated by insects?', options: ['50 percent', '60 percent', '75 percent', '90 percent'], correctAnswer: '75 percent', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-004-q6', type: 'short_answer', question: 'Name THREE animals whose food chains depend on insects, according to the passage.', correctAnswer: 'Birds, bats, amphibians, fish (any three)', explanation: 'Listed in the final paragraph.', marks: 2 },
      { id: 'rp-004-q7', type: 'sentence_completion', question: 'The transformation of hedgerows and meadows into farmland has eliminated the ecological ________ that insects depend on.', correctAnswer: 'corridors', explanation: 'Directly stated in the passage.', marks: 1 },
    ],
  },
  {
    id: 'rp-005',
    title: 'The Language of the Internet',
    topic: 'Language & Technology',
    source: 'Ikhora Content Team',
    cefrLevel: 'B1',
    wordCount: 320,
    timeLimitMinutes: 16,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-02-05T08:00:00Z',
    text: `The internet has changed almost every aspect of modern life, including the way people use language. Over the past three decades, a new form of written communication has emerged — one that mixes informal spelling, abbreviations, emojis, and a distinctive conversational style that would have been unrecognisable to previous generations.

Linguists have different opinions about what this means for language as a whole. Some believe that the casual, unedited nature of online communication is damaging the ability of young people to write formally and correctly. Teachers in many countries report that students frequently use abbreviations such as "lol", "omg", and "u" in formal essays and examination answers, suggesting that the boundaries between informal and formal registers are becoming blurred.

However, other linguists argue that the internet has not damaged language but simply expanded it. They point out that people have always adjusted their language to suit different contexts — speaking differently to friends than to employers, and writing differently in a personal letter than in an official report. Online communication is simply a new context, and most people are capable of switching between informal online language and formal written English when required.

There is also growing interest in how digital communication has created new words and phrases. Terms such as "selfie", "emoji", and "hashtag" have been added to major dictionaries, and expressions that originated online — such as "going viral" — are now used in mainstream news broadcasting. In this sense, the internet has not weakened language but enriched it.

What seems certain is that the relationship between language and technology will continue to evolve. How schools, employers, and language institutions respond to these changes will shape the linguistic landscape of the next generation.`,
    questions: [
      { id: 'rp-005-q1', type: 'true_false_not_given', question: 'All linguists agree that the internet is damaging young people\'s ability to write formally.', correctAnswer: 'False', explanation: 'The passage presents opposing views among linguists.', marks: 1 },
      { id: 'rp-005-q2', type: 'true_false_not_given', question: 'The word "selfie" has been added to major dictionaries.', correctAnswer: 'True', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-005-q3', type: 'true_false_not_given', question: 'The author concludes that the internet has definitively damaged the English language.', correctAnswer: 'Not Given', explanation: 'The author does not reach a definitive conclusion about damage.', marks: 1 },
      { id: 'rp-005-q4', type: 'mcq', question: 'According to the linguists who support internet communication, what is the key skill people demonstrate?', options: ['Ignoring formal rules entirely', 'Inventing new grammar structures', 'Switching between informal and formal language when required', 'Using abbreviations in all contexts'], correctAnswer: 'Switching between informal and formal language when required', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-005-q5', type: 'short_answer', question: 'Give ONE example from the passage of an internet expression now used in mainstream news.', correctAnswer: 'Going viral', explanation: 'Mentioned in the fourth paragraph.', marks: 1 },
    ],
  },
  {
    id: 'rp-006',
    title: 'Remote Work: Promise and Reality',
    topic: 'Work & Society',
    source: 'Ikhora Content Team',
    cefrLevel: 'B2',
    wordCount: 380,
    timeLimitMinutes: 20,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-02-10T08:00:00Z',
    text: `When millions of workers worldwide shifted to remote working during the pandemic years, many predicted a permanent transformation in the nature of employment. The removal of commuting time, the flexibility to work from home, and the demonstrable continuation of productivity seemed to suggest that traditional office culture had been rendered obsolete.

Several years on, the picture is more complicated. A significant number of large corporations have reversed their remote working policies, requiring employees to return to offices for some or all of their working week. The reasons given vary: some companies cite the importance of collaboration and spontaneous idea-sharing, while others point to concerns about younger employees who may miss out on mentoring and professional development that occurs naturally in physical workplaces.

Research on the productivity question has produced mixed results. Some studies show that remote workers complete tasks more efficiently and take fewer sick days. Others suggest that while individual task completion may improve, the collective creativity and problem-solving ability of teams — which often depends on unplanned conversations and informal interactions — may decline when people work in isolation.

The geography of remote work adds further complexity. For workers in well-equipped homes in suburban or rural areas, working remotely can offer genuine improvements in quality of life. For those in shared urban apartments with poor internet connectivity, or for parents managing childcare alongside professional responsibilities, the experience can be substantially more difficult.

What is clear is that remote and hybrid working is here to stay in some form. The question facing employers, employees, and policymakers alike is not whether flexible working should exist, but how to design it fairly and effectively — ensuring that it benefits individuals, organisations, and the broader society.`,
    questions: [
      { id: 'rp-006-q1', type: 'true_false_not_given', question: 'The pandemic caused many workers to shift to remote working.', correctAnswer: 'True', explanation: 'Directly stated in the first paragraph.', marks: 1 },
      { id: 'rp-006-q2', type: 'true_false_not_given', question: 'All major corporations have required employees to return to offices full-time.', correctAnswer: 'False', explanation: 'The passage says a "significant number" returned but does not say all.', marks: 1 },
      { id: 'rp-006-q3', type: 'true_false_not_given', question: 'Research unanimously shows that remote workers are more productive.', correctAnswer: 'False', explanation: 'The passage states research has "produced mixed results".', marks: 1 },
      { id: 'rp-006-q4', type: 'mcq', question: 'Which of the following is given as a concern about younger employees working remotely?', options: ['They are less motivated to work', 'They may miss out on mentoring and professional development', 'They are more likely to leave their jobs', 'They spend too much time on social media'], correctAnswer: 'They may miss out on mentoring and professional development', explanation: 'Directly stated in the second paragraph.', marks: 1 },
      { id: 'rp-006-q5', type: 'short_answer', question: 'According to the passage, for which type of worker can remote working offer genuine improvements in quality of life?', correctAnswer: 'Workers in well-equipped homes in suburban or rural areas', explanation: 'Stated in the fourth paragraph.', marks: 2 },
    ],
  },
  {
    id: 'rp-007',
    title: 'The Science of Sleep',
    topic: 'Health & Science',
    source: 'Ikhora Content Team',
    cefrLevel: 'B1',
    wordCount: 310,
    timeLimitMinutes: 16,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-02-15T08:00:00Z',
    text: `Sleep is often described as one of the most important things a person can do for their health, yet in many modern societies it is consistently undervalued. Long working hours, artificial lighting, and the constant availability of digital entertainment have combined to reduce average sleep duration significantly in recent decades.

Scientists have identified two main stages of sleep: rapid eye movement sleep (REM) and non-REM sleep. Non-REM sleep occurs first and involves three stages of progressively deeper rest. During the deepest stage, the body carries out essential repair work — producing growth hormones, strengthening the immune system, and repairing muscle tissue. REM sleep, which typically occupies around 20 to 25 percent of total sleep time in adults, is associated with dreaming and plays a critical role in consolidating memories and supporting emotional regulation.

The consequences of inadequate sleep are well-documented. Short-term effects include impaired concentration, slower reaction times, and reduced ability to perform complex tasks. People who sleep fewer than six hours per night show measurably worse performance on memory and problem-solving tests than those who sleep seven to nine hours. Long-term sleep deprivation has been linked to a significantly increased risk of heart disease, type 2 diabetes, obesity, and depression.

Recommendations for improving sleep quality focus on establishing consistent schedules, reducing exposure to screens before bedtime, limiting caffeine consumption in the afternoon, and maintaining a cool, dark sleeping environment. Many sleep researchers also emphasise the importance of natural light exposure during the day, which helps regulate the circadian rhythm — the body's internal clock — ensuring that the production of the sleep hormone melatonin occurs at the appropriate time each evening.`,
    questions: [
      { id: 'rp-007-q1', type: 'true_false_not_given', question: 'Average sleep duration has decreased significantly in many modern societies.', correctAnswer: 'True', explanation: 'Directly stated in the first paragraph.', marks: 1 },
      { id: 'rp-007-q2', type: 'true_false_not_given', question: 'REM sleep occurs first in the sleep cycle.', correctAnswer: 'False', explanation: 'The passage states non-REM sleep occurs first.', marks: 1 },
      { id: 'rp-007-q3', type: 'mcq', question: 'Approximately what proportion of total adult sleep time does REM sleep occupy?', options: ['10–15 percent', '20–25 percent', '30–35 percent', '40–45 percent'], correctAnswer: '20–25 percent', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-007-q4', type: 'mcq', question: 'Which of the following is listed as a long-term consequence of sleep deprivation?', options: ['Improved concentration', 'Reduced heart disease risk', 'Type 2 diabetes', 'Faster reaction times'], correctAnswer: 'Type 2 diabetes', explanation: 'Listed in the third paragraph.', marks: 1 },
      { id: 'rp-007-q5', type: 'sentence_completion', question: 'Natural light exposure during the day helps regulate the ________ ________, the body\'s internal clock.', correctAnswer: 'circadian rhythm', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-007-q6', type: 'short_answer', question: 'Name TWO activities that occur during the deepest stage of non-REM sleep.', correctAnswer: 'Producing growth hormones, strengthening immune system, repairing muscle tissue (any two)', explanation: 'Listed in the second paragraph.', marks: 2 },
    ],
  },
  {
    id: 'rp-008',
    title: 'The Economics of Renewable Energy',
    topic: 'Energy & Economics',
    source: 'Ikhora Content Team',
    cefrLevel: 'C1',
    wordCount: 430,
    timeLimitMinutes: 24,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-02-20T08:00:00Z',
    text: `The economics of renewable energy have undergone a profound transformation over the past decade. What was once considered an expensive alternative to fossil fuels has, in many markets, become the cheapest source of new electricity generation. The cost of solar photovoltaic modules fell by approximately 90 percent between 2010 and 2023, while the cost of utility-scale wind power declined by around 70 percent over the same period.

These cost reductions have been driven by a combination of technological improvement, manufacturing scale, and the learning curve effect — the well-established phenomenon whereby the cost of producing a technology tends to fall by a predictable percentage each time cumulative production doubles. Economies of scale in module manufacturing, improvements in energy conversion efficiency, and competitive procurement processes have all contributed.

The implications for energy markets are significant. In an increasing number of countries, it is now cheaper to build a new solar or wind installation than to operate an existing coal or gas plant. This has accelerated the retirement of fossil fuel capacity in some jurisdictions, though the pace of transition varies considerably depending on local policy frameworks, grid infrastructure, and the availability of financing.

However, the economics of renewable energy cannot be assessed in isolation from the broader energy system. The intermittent nature of solar and wind generation — which produce electricity only when the sun shines or wind blows — creates challenges for electricity grids accustomed to dispatchable power sources that can generate on demand. Integrating large quantities of variable renewable energy requires investment in grid infrastructure, interconnections between regions, and energy storage technologies, all of which add to the overall system cost.

The levelised cost of electricity — a measure that accounts for the full lifetime costs of a power plant — is increasingly used by analysts to compare energy sources. But critics argue that this metric fails to capture the additional system costs associated with variability, and that a more complete accounting would show the full transition costs to be substantially higher than headline renewable energy prices suggest.`,
    questions: [
      { id: 'rp-008-q1', type: 'true_false_not_given', question: 'The cost of solar PV modules fell by approximately 90% between 2010 and 2023.', correctAnswer: 'True', explanation: 'Directly stated in the first paragraph.', marks: 1 },
      { id: 'rp-008-q2', type: 'true_false_not_given', question: 'The learning curve effect applies only to renewable energy technologies.', correctAnswer: 'Not Given', explanation: 'The passage describes it as a "well-established phenomenon" without limiting it to renewables.', marks: 1 },
      { id: 'rp-008-q3', type: 'true_false_not_given', question: 'It is now cheaper to build a new solar installation than to operate an existing coal plant in most countries.', correctAnswer: 'Not Given', explanation: 'The passage says "an increasing number of countries", not most countries.', marks: 1 },
      { id: 'rp-008-q4', type: 'mcq', question: 'What is the "learning curve effect" as described in the passage?', options: ['The cost of education in a technology sector', 'The phenomenon where production costs fall as cumulative production doubles', 'The time it takes for workers to learn new manufacturing processes', 'The increase in efficiency as engineers gain experience'], correctAnswer: 'The phenomenon where production costs fall as cumulative production doubles', explanation: 'Directly stated in the passage.', marks: 1 },
      { id: 'rp-008-q5', type: 'mcq', question: 'What challenge does the intermittent nature of solar and wind present for electricity grids?', options: ['They produce too much electricity', 'They cannot be scaled up quickly enough', 'Grids are designed for dispatchable power sources', 'They require more land than fossil fuels'], correctAnswer: 'Grids are designed for dispatchable power sources', explanation: 'The passage states grids are "accustomed to dispatchable power sources that can generate on demand".', marks: 1 },
      { id: 'rp-008-q6', type: 'short_answer', question: 'What does "levelised cost of electricity" measure?', correctAnswer: 'The full lifetime costs of a power plant', explanation: 'Directly stated in the final paragraph.', marks: 2 },
      { id: 'rp-008-q7', type: 'sentence_completion', question: 'Critics argue that the levelised cost metric fails to capture the additional ________ costs associated with variability.', correctAnswer: 'system', explanation: 'Directly stated in the final paragraph.', marks: 1 },
    ],
  },
]
