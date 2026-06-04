import type { ListeningSection } from '../types'

export const LISTENING_SECTIONS: ListeningSection[] = [
  {
    id: 'ls-001',
    sectionNumber: 1,
    title: 'University Accommodation Enquiry',
    topic: 'Education & Campus Life',
    audioUrl: undefined,
    audioStatus: 'available',
    cefrLevel: 'B1',
    timeLimitSeconds: 600,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-10T08:00:00Z',
    transcript: `Officer: Good morning, University Accommodation Services. How can I help you today?
Student: Hi, I'm Sarah Mitchell. I'm a new student and I'd like to enquire about on-campus accommodation for the upcoming term.
Officer: Of course, Sarah. Can I just confirm your student ID number please?
Student: Yes, it's 4872931.
Officer: Thank you. And what course are you enrolled in?
Student: I'm studying Environmental Science, second year.
Officer: Great. Now, we have several accommodation options available. What type of room are you looking for?
Student: Ideally I'd like a single room with an en-suite bathroom if possible. I find it hard to concentrate in shared spaces.
Officer: We do have single rooms en-suite available in Block C and Block F. Block C is closer to the science buildings. What's your weekly budget?
Student: My maximum budget is about 180 pounds per week.
Officer: Block C is 165 pounds per week, so that fits well within your budget. It includes utilities and Wi-Fi. Would you like me to reserve a room there?
Student: Yes please, that sounds perfect. When can I move in?
Officer: Move-in day is the 15th of September. You'll receive a confirmation email with your room number and key collection details within the next 48 hours.
Student: Brilliant, thank you very much for your help.
Officer: You're welcome, Sarah. Good luck with your studies.`,
    questions: [
      {
        id: 'ls-001-q1',
        type: 'form_completion',
        question: 'Student name: ______',
        correctAnswer: 'Sarah Mitchell',
        explanation: 'The student introduces herself at the beginning of the conversation.',
        marks: 1,
      },
      {
        id: 'ls-001-q2',
        type: 'form_completion',
        question: 'Student ID number: ______',
        correctAnswer: '4872931',
        explanation: 'The student spells out her ID number.',
        marks: 1,
      },
      {
        id: 'ls-001-q3',
        type: 'form_completion',
        question: 'Course of study: ______',
        correctAnswer: 'Environmental Science',
        explanation: 'She states she is studying Environmental Science.',
        marks: 1,
      },
      {
        id: 'ls-001-q4',
        type: 'mcq',
        question: 'What type of accommodation does the student prefer?',
        options: ['Single room en-suite', 'Shared room', 'Studio apartment', 'Family accommodation'],
        correctAnswer: 'Single room en-suite',
        explanation: 'She specifies a single room with en-suite bathroom.',
        marks: 1,
      },
      {
        id: 'ls-001-q5',
        type: 'form_completion',
        question: 'Maximum weekly budget: £______',
        correctAnswer: '180',
        explanation: 'She states her maximum budget is £180 per week.',
        marks: 1,
      },
    ],
  },
  {
    id: 'ls-002',
    sectionNumber: 2,
    title: 'City Museum Audio Guide',
    topic: 'Culture & Heritage',
    audioUrl: undefined,
    audioStatus: 'available',
    cefrLevel: 'B2',
    timeLimitSeconds: 600,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-12T08:00:00Z',
    transcript: `Narrator: Welcome to the City Museum audio guide. This tour will take you through our most popular exhibits.
The City Museum was originally founded in 1862 by a group of local philanthropists who wanted to bring art and science to the public. It began as a small collection in a single building on High Street.
If you're standing in the main hall now, you'll notice the beautiful vaulted ceiling. This hall was completely renovated in 2019, thanks to a generous grant from the Heritage Foundation. The renovation preserved the original Victorian ironwork while adding modern climate control systems.
Moving to the galleries — Gallery 1 on your left houses our Ancient Egypt collection, including several sarcophagi dating back to 1500 BC. Gallery 2 features our acclaimed Modern Art wing, with works by local and international contemporary artists. Gallery 3, which was added during the renovation, showcases Local History exhibits about the city's industrial heritage.
If you continue to Gallery 4 at the far end, you'll find our Natural Sciences permanent collection, featuring fossils, minerals, and an impressive collection of butterfly specimens from around the world.
For those interested in facilities — the ground floor has a café and our well-stocked gift shop. On the second floor you'll find the children's activity room, which hosts workshops every weekend. The restaurant is on the same floor with lovely views of the park. And if you need to do research, our research library on the third floor holds over 50,000 reference books and is open to members.
The museum is open Monday to Saturday from 10 am to 6 pm. On Sundays we close earlier, at 5 pm. Last entry is always 30 minutes before closing.`,
    questions: [
      {
        id: 'ls-002-q1',
        type: 'mcq',
        question: 'When was the museum originally founded?',
        options: ['1847', '1862', '1891', '1910'],
        correctAnswer: '1862',
        explanation: 'The guide states the museum was founded in 1862.',
        marks: 1,
      },
      {
        id: 'ls-002-q2',
        type: 'note_completion',
        question: 'The main hall was renovated in ______ using a grant from the ______ Foundation.',
        correctAnswer: '2019, Heritage',
        explanation: 'The guide mentions the 2019 renovation funded by the Heritage Foundation.',
        marks: 2,
      },
      {
        id: 'ls-002-q3',
        type: 'matching',
        question: 'Match Gallery 4 to its current exhibition theme.',
        options: ['Ancient Egypt', 'Modern Art', 'Local History', 'Natural Sciences'],
        correctAnswer: 'Natural Sciences',
        explanation: 'Gallery 4 houses the Natural Sciences permanent collection.',
        marks: 1,
      },
      {
        id: 'ls-002-q4',
        type: 'mcq',
        question: 'What facility is on the third floor?',
        options: ['Gift shop', 'Children\'s activity room', 'Restaurant', 'Research library'],
        correctAnswer: 'Research library',
        explanation: 'The research library is located on the third floor.',
        marks: 1,
      },
      {
        id: 'ls-002-q5',
        type: 'form_completion',
        question: 'Museum closing time on Sundays: ______',
        correctAnswer: '5:00 pm',
        explanation: 'The guide specifies Sunday closing time.',
        marks: 1,
      },
    ],
  },
  {
    id: 'ls-003',
    sectionNumber: 3,
    title: 'Group Project Discussion — Urban Water Management',
    topic: 'Environment & Research',
    audioUrl: undefined,
    audioStatus: 'available',
    cefrLevel: 'B2',
    timeLimitSeconds: 720,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-15T08:00:00Z',
    transcript: `Tutor: Right, let's get started. So your group has chosen urban water management as your research topic. Can someone remind me of the exact focus?
James: Yeah, we've narrowed it down to groundwater depletion in urban areas, specifically looking at how rapid city expansion is affecting water tables in South Asian cities.
Tutor: Good. That's a well-defined scope. Now, how have you divided the work between you?
Priya: I've volunteered to take the literature review. I've already found several key papers from the last decade on aquifer depletion rates in Delhi and Dhaka.
Carlos: I'm handling the data analysis. I'm working with satellite data on groundwater levels from NASA's GRACE programme.
James: And I'm doing the policy recommendations section, looking at what interventions have worked in other regions.
Tutor: Okay, that sounds like a sensible division. Priya, for the literature review, I'd advise you to include more recent studies. A lot of the critical data on groundwater decline has only been published in the last five years. Try to focus on post-2020 publications where possible.
Priya: Understood. I'll refine my search to prioritise recent sources.
Tutor: One thing I'd flag — you all need to make sure your sections link together coherently. The literature review should set up the data analysis, which then informs the policy recommendations. Don't work in silos.
Carlos: That makes sense. Should we schedule weekly check-ins to make sure we're aligned?
Tutor: Absolutely. And remember, the final project deadline is the 14th of March at 5 pm. No extensions without prior approval. Submit via the online portal — don't email it to me directly.
James: Got it. We'll aim to have a full draft by early March so we have time to revise.
Tutor: That's a smart approach. Any other questions?
Priya: Just one — are we required to include primary data, or is secondary data sufficient?
Tutor: For this project, secondary data is absolutely fine. The satellite data Carlos is using counts as secondary data anyway. If you wanted to include a small survey, that would be a bonus, but it's not required.
James: Okay, we'll stick with secondary data then. Thanks for the guidance.
Tutor: No problem. Good luck with the project — I look forward to reading it.`,
    questions: [
      {
        id: 'ls-003-q1',
        type: 'mcq',
        question: 'What is the main focus of the group\'s research project?',
        options: [
          'Desalination technologies',
          'Groundwater depletion in urban areas',
          'Rainwater harvesting systems',
          'Water pricing policy',
        ],
        correctAnswer: 'Groundwater depletion in urban areas',
        explanation: 'The students clarify their project focus early in the discussion.',
        marks: 1,
      },
      {
        id: 'ls-003-q2',
        type: 'matching',
        question: 'Which student is responsible for the literature review?',
        options: ['James', 'Priya', 'Carlos', 'All three equally'],
        correctAnswer: 'Priya',
        explanation: 'Priya volunteers to take the literature review section.',
        marks: 1,
      },
      {
        id: 'ls-003-q3',
        type: 'mcq',
        question: 'What does the tutor suggest about their data sources?',
        options: [
          'They should rely only on government statistics',
          'They need to include more recent studies',
          'They have too many sources already',
          'They should focus only on one city',
        ],
        correctAnswer: 'They need to include more recent studies',
        explanation: 'The tutor advises including studies from the last five years.',
        marks: 1,
      },
      {
        id: 'ls-003-q4',
        type: 'note_completion',
        question: 'The final project deadline is ______ ______ at 5 pm.',
        correctAnswer: '14th March',
        explanation: 'The deadline is confirmed as 14th March.',
        marks: 1,
      },
    ],
  },
  {
    id: 'ls-004',
    sectionNumber: 4,
    title: 'Lecture: The History of Urban Planning',
    topic: 'History & Architecture',
    audioUrl: undefined,
    audioStatus: 'available',
    cefrLevel: 'C1',
    timeLimitSeconds: 720,
    status: 'published',
    visibility: 'global',
    createdBy: 'admin-001',
    createdAt: '2026-01-18T08:00:00Z',
    transcript: `Lecturer: Good morning, everyone. Today's lecture continues our series on the evolution of cities, and we'll be examining the history of urban planning from its earliest origins to contemporary challenges.
Let's begin at the very beginning. The first systematic urban planning principles were developed in ancient Greece. Thinkers like Hippodamus of Miletus proposed grid-based street layouts, arguing that rational geometric design would produce more orderly and functional cities. The Romans later adopted and expanded these ideas, introducing infrastructure like aqueducts, sewer systems, and paved roads that set new standards for urban living.
Moving forward to the medieval period, cities grew largely organically, without formal planning. Narrow winding streets, overcrowding, and poor sanitation characterised most European towns. It wasn't until the Renaissance that planned urban design re-emerged, with architects proposing ideal city designs based on symmetry and proportion.
Now, the critical turning point came in the nineteenth century. The Industrial Revolution caused unprecedented urban growth. Cities like London, Manchester, and Chicago expanded rapidly, and with that growth came serious public health crises. Cholera outbreaks, tuberculosis, and typhoid spread through densely packed slum districts with inadequate sanitation.
This is the key argument I want you to understand: nineteenth-century urban planning was primarily driven by public health concerns, not by aesthetic ambitions or economic imperatives. Reformers like Edwin Chadwick in Britain pushed for legislation requiring proper drainage, clean water supply, and minimum housing standards. The Public Health Act of 1875 in England was arguably the first major piece of urban planning legislation in the modern sense.
By the early twentieth century, a new vision emerged. The Garden City movement, founded by Ebenezer Howard in 1898, proposed self-contained communities surrounded by green belts, combining the best of town and country living. Howard's ideas were hugely influential and inspired suburban planning across Europe and North America.
Meanwhile, modernist architects like Le Corbusier proposed radical visions — cities of tall towers set in parkland, separating functions like housing, work, and leisure. While elegant in theory, many of these schemes proved socially problematic when built, creating isolated communities cut off from urban life.
In the post-war period, the focus shifted to car-oriented planning. Highways, parking structures, and suburban sprawl dominated thinking from the 1950s to the 1980s, particularly in North America. Jane Jacobs famously critiqued this approach, arguing for mixed-use neighbourhoods, walkable streets, and community-driven planning.
So where does that leave us today? The central challenge in contemporary urban planning is balancing density with quality of life. Cities need to accommodate growing populations — the UN predicts 68 percent of the world will live in cities by 2050 — but without sacrificing liveability. This means finding ways to build more housing in existing urban areas while maintaining green spaces, ensuring access to services, and preserving community character.
The consensus among planners today is that cities can achieve sustainability by focusing on green infrastructure and public transport. Investment in metro systems, cycling networks, and urban green spaces — parks, green roofs, urban forests — creates cities that are both dense and liveable. Cities like Copenhagen, Singapore, and Curitiba in Brazil are often cited as exemplars of this approach.
In next week's lecture, we'll examine specific case studies of sustainable urban development. For your tutorials, please read chapters 7 and 8 of the textbook.`,
    questions: [
      {
        id: 'ls-004-q1',
        type: 'note_completion',
        question: 'The first systematic urban planning principles were developed in ______.',
        correctAnswer: 'ancient Greece',
        explanation: 'The lecturer begins with ancient Greek contributions to planning.',
        marks: 1,
      },
      {
        id: 'ls-004-q2',
        type: 'mcq',
        question: 'What is the lecture\'s main argument about 19th-century planning?',
        options: [
          'It prioritised aesthetic beauty over functionality',
          'It was primarily driven by public health concerns',
          'It focused on industrial expansion at all costs',
          'It was exclusively concerned with wealthy districts',
        ],
        correctAnswer: 'It was primarily driven by public health concerns',
        explanation: 'The lecturer argues that cholera and disease outbreaks drove 19th-century planning reform.',
        marks: 1,
      },
      {
        id: 'ls-004-q3',
        type: 'note_completion',
        question: 'The Garden City movement was founded by ______.',
        correctAnswer: 'Ebenezer Howard',
        explanation: 'The lecturer names Ebenezer Howard as the founder.',
        marks: 1,
      },
      {
        id: 'ls-004-q4',
        type: 'mcq',
        question: 'According to the lecturer, what is the central challenge in contemporary urban planning?',
        options: [
          'Building enough roads for growing car use',
          'Balancing density with quality of life',
          'Preserving historic architecture',
          'Managing international migration',
        ],
        correctAnswer: 'Balancing density with quality of life',
        explanation: 'The final section focuses on this tension in modern planning.',
        marks: 1,
      },
      {
        id: 'ls-004-q5',
        type: 'note_completion',
        question: 'The lecturer says cities can achieve sustainability by focusing on ______ and ______ infrastructure.',
        correctAnswer: 'green, public transport',
        explanation: 'The lecture concludes with a call for green spaces and improved public transport.',
        marks: 2,
      },
    ],
  },
]
