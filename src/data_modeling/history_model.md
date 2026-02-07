I'll extract the data from this History exam paper and create a structured dataset with TypeScript interfaces for a Next.js web application.

## TypeScript Interfaces

```typescript
// types/history-exam.ts

export interface SubQuestion {
  id: string; // e.g., "1.1.1", "2.2.3"
  question: string;
  marks: number;
  type?: "short" | "comment" | "explain" | "quote" | "define";
}

export interface MainQuestion {
  id: string; // e.g., "1", "2", "3"
  title: string;
  description: string;
  totalMarks: number;
  subQuestions: SubQuestion[];
  sources?: string[]; // e.g., ["1A", "1B", "1C", "1D"]
}

export interface Section {
  id: "A" | "B";
  title: string;
  description: string;
  questions: MainQuestion[];
  type: "source-based" | "essay";
  minQuestions: number;
  maxQuestions: number;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  paper: string; // e.g., "P1"
  year: number;
  session: "May/June" | "November";
  totalMarks: number;
  totalTime: string; // e.g., "3 hours"
  sections: Section[];
  instructions: string[];
}

export interface SourceMaterial {
  id: string; // e.g., "1A", "2B", "3C"
  questionId: string; // e.g., "1", "2", "3"
  title: string;
  content: string;
  type?: "text" | "cartoon" | "speech" | "document";
}
```

## Sample Dataset (JSON)

```json
{
  "exam": {
    "id": "history-p1-may-june-2025",
    "title": "SENIOR CERTIFICATE EXAMINATIONS / NATIONAL SENIOR CERTIFICATE EXAMINATIONS",
    "subject": "HISTORY",
    "paper": "P1",
    "year": 2025,
    "session": "May/June",
    "totalMarks": 150,
    "totalTime": "3 hours",
    "instructions": [
      "Answer THREE questions as follows:",
      "At least ONE must be a source-based question and at least ONE must be an essay question.",
      "The THIRD question can be either a source-based question or an essay question.",
      "You are advised to spend ONE hour per question."
    ]
  },
  "sections": [
    {
      "id": "A",
      "title": "SOURCE-BASED QUESTIONS",
      "description": "Answer at least ONE question, but not more than TWO questions, in this section.",
      "type": "source-based",
      "minQuestions": 1,
      "maxQuestions": 2,
      "questions": [
        {
          "id": "1",
          "title": "THE COLD WAR: THE ORIGINS OF THE COLD WAR",
          "description": "HOW DID THE SPREAD OF COMMUNISM IN EUROPE AFTER THE SECOND WORLD WAR(1945) LEAD TO COLD WAR TENSIONS BETWEEN THE UNITED STATES OF AMERICA(USA) AND THE SOVIET UNION(USSR)?",
          "totalMarks": 50,
          "sources": ["1A", "1B", "1C", "1D"],
          "subQuestions": [
            {
              "id": "1.1.1",
              "question": "What, according to the source, was British Prime Minister Winston Churchill concerned about regarding the intentions of the Soviet Union and its communist international organisation?",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "1.1.2",
              "question": "Define the concept Iron Curtain in your own words.",
              "marks": 2,
              "type": "define"
            },
            {
              "id": "1.1.3",
              "question": "Identify any TWO famous cities in the source that lie under the Soviet sphere of influence.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "1.1.4",
              "question": "Comment on why you think British Prime Minister Churchill was worried about the rise and domination of communist parties in the eastern states of Europe.",
              "marks": 2,
              "type": "comment"
            },
            {
              "id": "1.1.5",
              "question": "Explain why a historian would consider this source reliable in understanding the threat posed by Soviet expansionism in Europe.",
              "marks": 4,
              "type": "explain"
            },
            {
              "id": "1.2.1",
              "question": "Comment on how Stalin has been portrayed in the cartoon.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "1.2.2a",
              "question": "Using the evidence in the source and your own knowledge, explain why communism had not expanded into Greece.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "1.2.2b",
              "question": "Using the evidence in the source and your own knowledge, explain why communism had not expanded into Turkey.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "1.2.2c",
              "question": "Using the evidence in the source and your own knowledge, explain why communism had not expanded into France.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "1.3.1",
              "question": "Who, according to the source, replaced Byrnes as the US Secretary of State in 1947?",
              "marks": 1,
              "type": "short"
            },
            {
              "id": "1.3.2",
              "question": "Identify TWO reasons in the source that the anti-communist governments of Turkey and Greece put forward for USA's help.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "1.3.3",
              "question": "Comment on why Acheson regarded the session of the Congress to take a decision on providing aid to Turkey and Greece, as 'Armageddon'.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "1.3.4",
              "question": "Give TWO reasons, according to the source, that Acheson advanced when he changed the terms of the debate on the need to assist Greece and Turkey.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "1.4",
              "question": "Comment on how the information in Source 1A supports the evidence in Source 1C regarding the spread of communism in Europe after the Second World War.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "1.5.1",
              "question": "Name TWO East European countries in the source that showed a keen interest in the European Recovery Programme.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "1.5.2",
              "question": "According to the source, why did Stalin warn the Czechs and others against participating in the European Recovery Programme?",
              "marks": 1,
              "type": "short"
            },
            {
              "id": "1.5.3",
              "question": "Explain the concept Stalinisation in the context of the Cold War in Eastern Europe.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "1.5.4",
              "question": "Using the information in the source and your own knowledge, comment on how the coup in Czechoslovakia and the Berlin Crisis 'damage(d) the Soviet image in Europe'.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "1.6",
              "question": "Using the information in the relevant sources and your own knowledge, write a paragraph of about EIGHT lines(about 80 words) explaining how the spread of communism in Europe after the Second World War(1945) lead to Cold War tensions between the United States of America(USA) and the Soviet Union(USSR).",
              "marks": 8,
              "type": "explain"
            }
          ]
        },
        {
          "id": "2",
          "title": "INDEPENDENT AFRICA: CASE STUDY – ANGOLA",
          "description": "WHAT IMPACT DID REGIONAL ETHNIC DIVISIONS IN ANGOLA HAVE ON THE CIVIL WAR DURING THE 1970s?",
          "totalMarks": 50,
          "sources": ["2A", "2B", "2C", "2D"],
          "subQuestions": [
            {
              "id": "2.1.1",
              "question": "What, according to the source, was partly responsible for the stagnation of the anticolonial war in Angola?",
              "marks": 1,
              "type": "short"
            },
            {
              "id": "2.1.2",
              "question": "Define the concept nationalist forces in your own words.",
              "marks": 2,
              "type": "define"
            },
            {
              "id": "2.1.3",
              "question": "Comment on what is implied by the statement,'the Portuguese army controlled the borders and was free to move anywhere in the country', in the context of the impact of anticolonial movements.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "2.1.4",
              "question": "Quote TWO pieces of evidence from the source which suggest that the Portuguese policy of colonialism changed on 25 April 1974.",
              "marks": 2,
              "type": "quote"
            },
            {
              "id": "2.2.1",
              "question": "Identify THREE Angolan parties in the source that opposed Portuguese colonial rule in the 1950s.",
              "marks": 3,
              "type": "short"
            },
            {
              "id": "2.2.2",
              "question": "In the context of a coalition government in Angola, comment on what is implied by the statement,'Each liberation movement had its preference if a nationalist coalition(alliance) should prove impossible'.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "2.2.3",
              "question": "State any TWO steps in the source taken by the Organisation of African Unity(OAU) before the date of the Angolan independence could be fixed.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "2.2.4",
              "question": "Explain the term coalition government in the context of the Angolan government in 1975.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "2.3.1",
              "question": "With reference to the evidence in the source and your own knowledge, explain why you think that among the three liberation movements, it would be easy for the MPLA to take control of Luanda and form the government of Angola.",
              "marks": 4,
              "type": "explain"
            },
            {
              "id": "2.3.2",
              "question": "Using the evidence in the source and your own knowledge, explain why it was convenient for Zaire(the Congo) to support the FNLA.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "2.3.3",
              "question": "Comment on the usefulness of this source for a historian researching the Angolan Civil War of 1975.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "2.4",
              "question": "Explain how the information in Source 2B supports the evidence in Source 2C regarding the regional ethnic divisions that existed during the Angolan Civil War.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "2.5.1",
              "question": "Identify TWO pieces of evidence in the source that indicate how the Portuguese government fuelled the rivalry amongst liberation movements during the civil war in Angola.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "2.5.2",
              "question": "Using the information in the source and your own knowledge, comment on how the civil war in Angola escalated into a Cold War.",
              "marks": 2,
              "type": "comment"
            },
            {
              "id": "2.5.3",
              "question": "According to the source, conflicts and absence of cooperation among the three Angolan liberation movements were based on TWO factors. Name these factors.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "2.5.4",
              "question": "Explain why the FNLA and UNITA depicted their enemy(MPLA) as a continuation of the colonial system that continued to reproduce distinctions of race and class in Angola.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "2.6",
              "question": "Using the information in the relevant sources and your own knowledge, write a paragraph of about EIGHT lines(about 80 words) explaining the impact that regional ethnic divisions in Angola had on the civil war during the 1970s.",
              "marks": 8,
              "type": "explain"
            }
          ]
        },
        {
          "id": "3",
          "title": "CIVIL SOCIETY PROTESTS FROM THE 1950s TO THE 1970s: THE US CIVIL RIGHTS MOVEMENT",
          "description": "HOW DID STATE AUTHORITIES IN ALABAMA DEAL WITH THE NON-VIOLENT CHILDREN'S MARCH DURING THE BIRMINGHAM CAMPAIGN IN 1963?",
          "totalMarks": 50,
          "sources": ["3A", "3B", "3C", "3D"],
          "subQuestions": [
            {
              "id": "3.1.1",
              "question": "According to the source, why was Birmingham nicknamed 'Bombingham'?",
              "marks": 1,
              "type": "short"
            },
            {
              "id": "3.1.2",
              "question": "Define the term civil rights activists in your own words.",
              "marks": 2,
              "type": "define"
            },
            {
              "id": "3.1.3",
              "question": "Using the information in the source and your own knowledge, explain why Dr King was imprisoned.",
              "marks": 4,
              "type": "explain"
            },
            {
              "id": "3.1.4",
              "question": "Quote any TWO ways from the source indicating how the police dealt with the protestors during the Children's March.",
              "marks": 2,
              "type": "quote"
            },
            {
              "id": "3.1.5",
              "question": "Identify TWO ways in the source in which young black men in the city's poorest section retaliated to being assaulted and attacked by the police.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "3.2.1",
              "question": "State any TWO demands in the source that the protestors made during the Children's March of the Birmingham campaign.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "3.2.2",
              "question": "Explain why the presence of Martin Luther King Jr at the Children's March could have given it some credibility.",
              "marks": 4,
              "type": "explain"
            },
            {
              "id": "3.3",
              "question": "Explain how these sources support each other regarding the protests of the Children's March during the Birmingham campaign in 1963.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "3.4.1",
              "question": "According to the source, what did Audrey Faye Hendriks recall about the Children's March? Give TWO responses.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "3.4.2",
              "question": "Comment on why policemen suggested to Audrey Faye that'she had been forced to participate' in the Children's March.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "3.4.3",
              "question": "Identify evidence in the source which suggests that conditions for the children who were placed in police cells were not good for their health.",
              "marks": 1,
              "type": "short"
            },
            {
              "id": "3.4.4",
              "question": "Explain the limitations of the source for a historian researching the Children's March during the Birmingham campaign in 1963.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "3.5.1",
              "question": "According to the source, who was stunned by the shocking images of the Birmingham campaign? Give TWO responses.",
              "marks": 2,
              "type": "short"
            },
            {
              "id": "3.5.2",
              "question": "Comment on what Gloria Clark implied by the words,'And I said no way is he going to define how people are treated in this country I live in' in the context of how protestors were dealt with during the Birmingham campaign.",
              "marks": 4,
              "type": "comment"
            },
            {
              "id": "3.5.3",
              "question": "Explain the term desegregate in the context of changes to discriminatory laws in the US in the 1960s.",
              "marks": 2,
              "type": "explain"
            },
            {
              "id": "3.5.4",
              "question": "What conclusion can you draw from the statement,'... Kennedy believed it was time to put civil rights at the forefront of his agenda ...' in the context of the impact of the Birmingham campaign?",
              "marks": 2,
              "type": "comment"
            },
            {
              "id": "3.6",
              "question": "Using the information in the relevant sources and your own knowledge, write a paragraph of about EIGHT lines(about 80 words) explaining how state authorities in Alabama dealt with the non-violent Children's March during the Birmingham campaign in 1963.",
              "marks": 8,
              "type": "explain"
            }
          ]
        }
      ]
    },
    {
      "id": "B",
      "title": "ESSAY QUESTIONS",
      "description": "Answer at least ONE question, but NOT more than TWO questions, in this section. Your essay should be about THREE pages long.",
      "type": "essay",
      "minQuestions": 1,
      "maxQuestions": 2,
      "questions": [
        {
          "id": "4",
          "title": "THE EXTENSION OF THE COLD WAR: CASE STUDY – VIETNAM",
          "description": "Military strategies adopted by the US army were unable to defeat a small dedicated army of Viet Cong guerrillas in the Vietnam War between 1962 and 1973. Do you agree with the statement? Substantiate your answer with relevant historical evidence.",
          "totalMarks": 50,
          "subQuestions": []
        },
        {
          "id": "5",
          "title": "INDEPENDENT AFRICA: CASE STUDY – THE CONGO",
          "description": "Critically discuss the effectiveness of Mobutu Sese Seko's political and economic policies in developing the Congo after attaining independence from Belgian colonial rule in the 1960s.",
          "totalMarks": 50,
          "subQuestions": []
        },
        {
          "id": "6",
          "title": "CIVIL SOCIETY PROTESTS FROM THE 1950s TO THE 1970s: THE BLACK POWER MOVEMENT",
          "description": "Explain to what extent the Black Power philosophy successfully instilled self-pride and courage among African Americans in confronting segregation and police brutality in the United States of America during the 1960s and the 1970s. Support your line of argument with relevant historical evidence.",
          "totalMarks": 50,
          "subQuestions": []
        }
      ]
    }
  ]
}
```

## Database Schema (Prisma)

```prisma
// schema.prisma

model ExamPaper {
  id          String    @id @default(uuid())
  title       String
  subject     String
  paper       String    // P1, P2, etc.
  year        Int
  session     String    // "May/June" or "November"
  totalMarks  Int
  totalTime   String    // "3 hours"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  sections    Section[]
  instructions Instruction[]
}

model Section {
  id            String   @id @default(uuid())
  examPaperId   String
  examPaper     ExamPaper @relation(fields: [examPaperId], references: [id], onDelete: Cascade)
  sectionId     String   // "A" or "B"
  title         String
  description   String
  type          String   // "source-based" or "essay"
  minQuestions  Int
  maxQuestions  Int

  questions     Question[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([examPaperId, sectionId])
}

model Question {
  id          String   @id @default(uuid())
  sectionId   String
  section     Section  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  questionId  String   // "1", "2", "3", etc.
  title       String
  description String
  totalMarks  Int
  sources     String[] // ["1A", "1B", "1C", "1D"]
  order       Int      // for ordering questions

  subQuestions SubQuestion[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([sectionId, questionId])
}

model SubQuestion {
  id          String   @id @default(uuid())
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  subQuestionId String // "1.1.1", "1.1.2", etc.
  questionText String
  marks       Int
  type        String?  // "short", "comment", "explain", "quote", "define"
  order       Int      // for ordering sub-questions

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([questionId, subQuestionId])
}

model Instruction {
  id          String   @id @default(uuid())
  examPaperId String
  examPaper   ExamPaper @relation(fields: [examPaperId], references: [id], onDelete: Cascade)
  text        String
  order       Int

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SourceMaterial {
  id          String   @id @default(uuid())
  sourceId    String   // "1A", "2B", "3C", etc.
  questionId  String   // Links to main question "1", "2", "3"
  title       String?
  content     String
  type        String?  // "text", "cartoon", "speech", "document"

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([sourceId, questionId])
}
```

## Next.js API Routes Example

```typescript
// pages/api/exams/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  try {
    const exam = await prisma.examPaper.findUnique({
      where: { id: String(id) },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                subQuestions: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { sectionId: "asc" },
        },
        instructions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
```

## React Component Example

```typescript
// components/ExamQuestion.tsx
import { Question } from '@/types/history-exam';

interface ExamQuestionProps {
  question: Question;
  onSelect?: (questionId: string) => void;
  isSelected?: boolean;
}

export function ExamQuestion({
  question,
  onSelect,
  isSelected
}: ExamQuestionProps) {
  return (
    <div
      className={`border rounded-lg p-4 mb-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300'
      }`}
      onClick={() => onSelect?.(question.id)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg mb-2">{question.title}</h3>
          <p className="text-gray-700 mb-3">{question.description}</p>

          {question.sources && (
            <div className="flex flex-wrap gap-2 mb-3">
              {question.sources.map((source) => (
                <span
                  key={source}
                  className="bg-gray-200 px-2 py-1 rounded text-sm"
                >
                  Source {source}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-green-100 text-green-800 px-3 py-1 rounded font-semibold">
          {question.totalMarks} marks
        </div>
      </div>

      {question.subQuestions.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Sub-questions:</h4>
          <ul className="space-y-2">
            {question.subQuestions.map((subQ) => (
              <li key={subQ.id} className="text-sm text-gray-600">
                <span className="font-medium">{subQ.id}:</span> {subQ.question}
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                  {subQ.marks} marks
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

This structure provides a comprehensive foundation for building a History exam revision/practice application in Next.js. The data is fully typed, database-ready, and organized for easy querying and display.
