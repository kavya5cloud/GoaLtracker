import { SyllabusNode } from './types';

export const UPSC_SYLLABUS: SyllabusNode[] = [
  {
    id: 'GS1',
    title: 'General Studies I',
    children: [
      {
        id: 'GS1-ART',
        title: 'Indian Heritage and Culture',
        children: [
          { id: 'GS1-ART-01', title: 'Art Forms, Literature and Architecture', isTopic: true },
          { id: 'GS1-ART-02', title: 'Bhakti & Sufi Movements', isTopic: true },
        ]
      },
      {
        id: 'GS1-HIST',
        title: 'History',
        children: [
          { id: 'GS1-HIST-01', title: 'Modern Indian History (mid-18th century to present)', isTopic: true },
          { id: 'GS1-HIST-02', title: 'The Freedom Struggle', isTopic: true },
          { id: 'GS1-HIST-03', title: 'Post-independence Consolidation', isTopic: true },
          { id: 'GS1-HIST-04', title: 'History of the World (Industrial Rev, World Wars)', isTopic: true },
        ]
      },
      {
        id: 'GS1-GEO',
        title: 'Geography',
        children: [
          { id: 'GS1-GEO-01', title: 'Salient features of World’s Physical Geography', isTopic: true },
          { id: 'GS1-GEO-02', title: 'Distribution of Key Natural Resources', isTopic: true },
          { id: 'GS1-GEO-03', title: 'Geophysical Phenomena (Earthquakes, Tsunami, etc)', isTopic: true },
        ]
      },
      {
        id: 'GS1-SOC',
        title: 'Indian Society',
        children: [
          { id: 'GS1-SOC-01', title: 'Role of Women and Women’s Organization', isTopic: true },
          { id: 'GS1-SOC-02', title: 'Population and Associated Issues', isTopic: true },
          { id: 'GS1-SOC-03', title: 'Poverty and Developmental Issues', isTopic: true },
          { id: 'GS1-SOC-04', title: 'Urbanization: Problems and Remedies', isTopic: true },
          { id: 'GS1-SOC-05', title: 'Effects of Globalization on Indian Society', isTopic: true },
        ]
      }
    ]
  },
  {
    id: 'GS2',
    title: 'General Studies II',
    children: [
      {
        id: 'GS2-POLITY',
        title: 'Polity & Constitution',
        children: [
          { id: 'GS2-POL-01', title: 'Indian Constitution: Historical Underpinnings', isTopic: true },
          { id: 'GS2-POL-02', title: 'Functions and Responsibilities of the Union and the States', isTopic: true },
          { id: 'GS2-POL-03', title: 'Separation of Powers', isTopic: true },
          { id: 'GS2-POL-04', title: 'Parliament and State Legislatures', isTopic: true },
        ]
      },
      {
        id: 'GS2-GOV',
        title: 'Governance',
        children: [
          { id: 'GS2-GOV-01', title: 'Government Policies and Interventions', isTopic: true },
          { id: 'GS2-GOV-02', title: 'Role of Civil Services in Democracy', isTopic: true },
        ]
      },
      {
        id: 'GS2-IR',
        title: 'International Relations',
        children: [
          { id: 'GS2-IR-01', title: 'India and its Neighborhood Relations', isTopic: true },
          { id: 'GS2-IR-02', title: 'Bilateral, Regional and Global Groupings', isTopic: true },
        ]
      }
    ]
  },
  {
    id: 'GS3',
    title: 'General Studies III',
    children: [
      {
        id: 'GS3-ECO',
        title: 'Economy',
        children: [
          { id: 'GS3-ECO-01', title: 'Indian Economy and Issues relating to Planning', isTopic: true },
          { id: 'GS3-ECO-02', title: 'Inclusive Growth and issues arising from it', isTopic: true },
          { id: 'GS3-ECO-03', title: 'Government Budgeting', isTopic: true },
        ]
      },
      {
        id: 'GS3-AGRI',
        title: 'Agriculture',
        children: [
          { id: 'GS3-AGRI-01', title: 'Major Crops and Cropping Patterns', isTopic: true },
          { id: 'GS3-AGRI-02', title: 'Issues related to Direct and Indirect Farm Subsidies', isTopic: true },
        ]
      },
      {
        id: 'GS3-SCI',
        title: 'Science & Tech',
        children: [
          { id: 'GS3-SCI-01', title: 'Developments in S&T', isTopic: true },
          { id: 'GS3-SCI-02', title: 'Indigenization of Technology', isTopic: true },
        ]
      },
      {
        id: 'GS3-ENV',
        title: 'Environment',
        children: [
          { id: 'GS3-ENV-01', title: 'Conservation, Pollution and Degradation', isTopic: true },
          { id: 'GS3-ENV-02', title: 'Environmental Impact Assessment', isTopic: true },
        ]
      }
    ]
  },
  {
    id: 'GS4',
    title: 'General Studies IV',
    children: [
      { id: 'GS4-ETH-01', title: 'Ethics and Human Interface', isTopic: true },
      { id: 'GS4-ETH-02', title: 'Attitude', isTopic: true },
      { id: 'GS4-ETH-03', title: 'Aptitude and Foundational Values', isTopic: true },
      { id: 'GS4-ETH-04', title: 'Emotional Intelligence', isTopic: true },
      { id: 'GS4-ETH-05', title: 'Probity in Governance', isTopic: true },
      { id: 'GS4-ETH-06', title: 'Case Studies on above issues', isTopic: true },
    ]
  }
];

export const MENTOR_SYSTEM_INSTRUCTION = `
You are an elite UPSC Mentor and a former AIR 1 Topper known for "Deep Conceptual Clarity". 
Your goal is to transform the student's understanding from superficial to profound.

Core Persona:
1. **Analytical Depth**: You reject rote learning. You explain the 'Why' and 'How' behind every concept.
2. **Interdisciplinary Linkages**: You seamlessly connect Polity with Ethics, Economy with Geography, and History with IR.
3. **Mains Focused**: Your explanations always include critique, challenges, and the way forward.
4. **Current Affairs Integration**: You constantly reference recent editorials, indices, and government schemes.

Tone: Intellectual, Precise, Encouraging, and Rigorous.
`;

export const STUDY_PLAN_PROMPT = `
Create a "Deep Dive" Masterclass document for the UPSC Civil Services Mains Examination on the topic below. 
The content must be analytically rigorous, conceptually deep, and suitable for high-scoring Mains answers. 
Avoid generic summaries. Focus on nuance.

Structure the response in Markdown as follows:

## 1. Conceptual Deconstruction
- **Core Principle**: Define the concept with precision. 
- **The Philosophy**: What is the underlying philosophy or mechanism? (e.g., *Why* do we have this?)
- **Evolution**: Briefly trace the historical context or evolution.

## 2. Multi-Dimensional Analysis (Deep Insights)
- *Analyze the topic through multiple lenses (PESTLE approach where applicable):*
- **Political/Administrative**: Power dynamics, federal issues, bureaucratic bottlenecks.
- **Economic/Social**: Fiscal implications, societal impact, equity concerns.
- **Ethical/Legal**: Constitutional morality, justice, rights.

## 3. Critical Critique (The "Topper's Edge")
- **The Paradox**: What are the inherent contradictions or ironies in this topic?
- **Implementation Challenges**: Why does it fail on the ground?
- **Current Debates**: What are scholars/experts arguing about right now?

## 4. High-Value Enrichment
- **Supreme Court Judgments**: Cite specific cases (e.g., *Kesavananda Bharati*, *Puttaswamy*).
- **Reports & Committees**: Quote ARC, Sarkaria, Punchhi, NITI Aayog, or Economic Survey.
- **Data Points**: 1-2 striking, authoritative statistics.

## 5. The Way Forward
- **Structural Reforms**: Long-term solutions.
- **Immediate Measures**: Short-term fixes.
- **Conclusion**: A balanced, optimistic closing statement suitable for an answer.

Topic:
`;