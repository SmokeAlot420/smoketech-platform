# Vertex AI Creative Studio Integration Patterns

**Research Source**: `E:\v2 repo\vertex-ai-creative-studio`
**Date**: 2025-10-02
**Purpose**: Extract UI patterns, workflow architectures, and quality assessment methods for Next.js integration

---

## Table of Contents
1. [VEO3 Character Consistency Workflow](#veo3-character-consistency-workflow)
2. [Genetic Prompt Optimizer (LLM-as-a-Judge)](#genetic-prompt-optimizer-llm-as-a-judge)
3. [Configuration Patterns](#configuration-patterns)
4. [Quality Assessment Patterns](#quality-assessment-patterns)
5. [Error Handling & Reliability](#error-handling--reliability)
6. [Next.js Adaptation Strategies](#nextjs-adaptation-strategies)

---

## VEO3 Character Consistency Workflow

### Architecture Overview

**File**: `experiments/veo3-character-consistency/main.py`

The character consistency workflow uses a **4-stage pipeline** with progressive refinement:

```
Stage 1: Image Analysis → Stage 2: Image Generation → Stage 3: Image Selection → Stage 4: Video Generation
```

### Stage 1: Image Analysis with Structured Extraction

**Pattern**: Multi-step facial analysis with schema validation

```python
# Step 1: Extract structured facial profile
profile_config = GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=FacialCompositeProfile.model_json_schema(),
    temperature=0.1,  # Low temp for consistency
)

# Step 2: Convert structured data to natural language
description_response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[f"Based on the following JSON... write a natural language description"],
    config=GenerateContentConfig(temperature=0.1)
)
```

**Key Insight**: Two-step process ensures:
1. Structured extraction (JSON schema) for precise data
2. Natural language conversion for image generation

**Next.js Adaptation**:
```typescript
// Character analysis service
interface FacialCompositeProfile {
  face_shape: string;
  skin_tone: string;
  hair_description: string;
  eye_description: string;
  distinctive_features: string[];
}

async function analyzeCharacterImages(imagePaths: string[]) {
  // Step 1: Structured extraction
  const profiles = await Promise.all(imagePaths.map(async (path) => {
    const response = await gemini.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        "You are a forensic analyst. Extract facial profile...",
        { inlineData: { data: imageBase64, mimeType: "image/png" } }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: FacialCompositeProfile,
        temperature: 0.1
      }
    });
    return JSON.parse(response.text);
  }));

  // Step 2: Natural language synthesis
  const description = await gemini.generateContent({
    model: "gemini-2.5-pro",
    contents: [`Based on this JSON profile: ${JSON.stringify(profiles[0])}...`],
    generationConfig: { temperature: 0.1 }
  });

  return { profiles, naturalDescription: description.text };
}
```

### Stage 2: Scene Prompt Generation with Meta-Prompting

**Pattern**: Combine character description with user scenario

**File**: `experiments/veo3-character-consistency/image_generator.py:72-107`

```python
def _generate_final_scene_prompt(base_description: str, user_prompt: str):
    """Generates detailed prompt combining character + scene"""

    meta_prompt = f"""
    You are an expert prompt engineer for text-to-image generation.

    **Person Description:**
    {base_description}

    **User's Desired Scene:**
    {user_prompt}

    **Instructions:**
    1. Combine person + scene into coherent, detailed prompt
    2. Add photorealistic photography keywords (lens type, lighting, composition)
    3. Ensure person performs action requested by user
    4. Generate negative prompt for quality
    """

    return client.models.generate_content(
        model="gemini-2.5-pro",
        contents=[meta_prompt],
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=GeneratedPrompts.model_json_schema()
        )
    )
```

**Next.js Pattern**:
```typescript
interface GeneratedPrompts {
  prompt: string;
  negative_prompt: string;
}

async function generateScenePrompt(
  characterDescription: string,
  userScenario: string
): Promise<GeneratedPrompts> {
  const metaPrompt = `
    You are an expert prompt engineer for text-to-image generation.

    **Person Description:**
    ${characterDescription}

    **User's Desired Scene:**
    ${userScenario}

    **Instructions:**
    1. Combine person + scene into single coherent prompt
    2. Add photography keywords: lens type (85mm), lighting (cinematic), composition
    3. Ensure final prompt describes person performing user's requested action
    4. Generate standard negative prompt to avoid artistic flaws
  `;

  const response = await gemini.generateContent({
    model: "gemini-2.5-pro",
    contents: [metaPrompt],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          prompt: { type: "string" },
          negative_prompt: { type: "string" }
        },
        required: ["prompt", "negative_prompt"]
      },
      temperature: 0.3
    }
  });

  return JSON.parse(response.text);
}
```

### Stage 3: Best Image Selection with LLM Judge

**Pattern**: Multi-image comparison with reasoning

**File**: `experiments/veo3-character-consistency/utils/select_best.py`

```python
def select_best_image(real_image_paths: List[str], generated_image_paths: List[str]):
    """Uses Gemini to select best character match"""

    prompt_parts = [
        "Analyze these images. First set = real photos. Second set = AI-generated.",
        "Select generated image that best represents the person from real photos.",
        "Focus on facial/physical traits, not clothing or style.",
        "Provide path of best image and your reasoning.",
        "\n--- REAL IMAGES ---"
    ]

    # Add all real images
    for path in real_image_paths:
        prompt_parts.append(Image.from_file(path))

    prompt_parts.append("\n--- GENERATED IMAGES ---")

    # Add all generated images with labels
    for path in generated_image_paths:
        prompt_parts.append(f"Image path: {path}")
        prompt_parts.append(Image.from_file(path))

    return client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt_parts,
        config=GenerateContentConfig(
            thinking_config=ThinkingConfig(thinking_budget=-1),  # Enable deep thinking
            response_mime_type="application/json",
            response_schema=BestImage.model_json_schema()
        )
    )
```

**Next.js Pattern**:
```typescript
interface BestImageSelection {
  best_image_path: string;
  reasoning: string;
}

async function selectBestCharacterImage(
  realImages: string[],
  generatedImages: string[]
): Promise<BestImageSelection> {
  const parts = [
    { text: "Analyze these images. First set = real photos of person. Second set = AI-generated." },
    { text: "Select the generated image that best represents the person from real photos." },
    { text: "Focus on facial and physical traits, NOT clothing or style." },
    { text: "Provide the path of best image and your reasoning." },
    { text: "\n--- REAL IMAGES ---" }
  ];

  // Add real reference images
  realImages.forEach(path => {
    parts.push({
      inlineData: {
        data: fs.readFileSync(path).toString('base64'),
        mimeType: "image/png"
      }
    });
  });

  parts.push({ text: "\n--- GENERATED IMAGES ---" });

  // Add generated candidates with labels
  generatedImages.forEach(path => {
    parts.push({ text: `Image path: ${path}` });
    parts.push({
      inlineData: {
        data: fs.readFileSync(path).toString('base64'),
        mimeType: "image/png"
      }
    });
  });

  const response = await gemini.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          best_image_path: { type: "string" },
          reasoning: { type: "string" }
        },
        required: ["best_image_path", "reasoning"]
      },
      temperature: 0.2
    },
    thinkingConfig: { thinkingBudget: -1 }  // Enable extended thinking
  });

  return JSON.parse(response.text);
}
```

### Stage 4: Video Prompt Generation with Cinematic Enhancement

**Pattern**: Image-aware video prompt engineering

**File**: `experiments/veo3-character-consistency/prompts.py:19-60`

The VEO cinematic prompt engineer uses a **structured 4-step process**:

```typescript
const VEO_CINEMATIC_PROMPT_ENGINEER = `
You are an expert Cinematic Prompt Engineer for Veo. Transform basic prompts into masterful video prompts.

**1. Deconstruct & Anchor (Fidelity is Paramount)**
- Image Fidelity: Identify every key visual anchor (subject, objects, setting, composition, lighting, aesthetic)
- CRITICAL: Repeat core visual anchors throughout prompt (e.g., "red cup on wooden table" not "the cup")
- Intent Fidelity: Preserve user's core intent (slow motion, animate dancer, etc.)
- Conceptual Fidelity: Translate abstract concepts to concrete visual narratives

**2. Build the World (Cinematic & Sensory Enrichment)**
- Subject & Action: Add specificity, emotion, texture
  * Instead of "woman": "elderly woman with kind, crinkled eyes and silver hair in neat bun"
  * Instead of "dancing": "performing lively 1920s Charleston, feet swiveling, beaded dress shimmering"
- Incorporate Diversity: Age, ethnicity, cultural background, ability, body type
- Weave in Secondary Motion: "wisps of hair flutter in breeze", "steam rises from teacup"
- Scene & Ambiance: Build complete world with location, time, weather, background

**3. Direct the Camera (Technical & Stylistic Specification)**
- Camera & Movement: Combine shot type with movement
  * "low-angle tracking shot follows the hero"
  * "extreme close-up with slow dolly in"
- Lens & Optical Effects: Add photographic detail
  * "shallow depth of field with creamy bokeh"
  * "wide-angle lens distortion", "telephoto lens compression"
- Overall Style: Define cohesive aesthetic
  * "Photorealistic, hyperrealistic, 8K, cinematic"
  * "Film noir style, deep shadows, stark highlights, B&W"

**4. Synthesize & Finalize**
- Output: Single cohesive paragraph, ready for Veo
- Self-check: Anchoring, Specificity, Cinematography, Cohesion
- Safety: Adhere to responsible AI guidelines
`;
```

**Next.js Implementation**:
```typescript
async function generateCinematicVideoPrompt(
  bestImagePath: string,
  userScenario: string
): Promise<string> {
  const imageData = fs.readFileSync(bestImagePath);

  const response = await gemini.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      { text: VEO_CINEMATIC_PROMPT_ENGINEER },
      { text: `User scenario: ${userScenario}` },
      { text: "Reference image to animate:" },
      {
        inlineData: {
          data: imageData.toString('base64'),
          mimeType: "image/png"
        }
      }
    ],
    generationConfig: {
      temperature: 1.0,  // Higher temp for creativity
      topP: 0.95
    },
    thinkingConfig: { thinkingBudget: -1 }
  });

  return response.text.trim();
}
```

### Complete Workflow Integration

**Next.js API Route Pattern**:

```typescript
// app/api/character-consistency-video/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { referenceImages, scenario } = await req.json();

  try {
    // Stage 1: Analyze reference images
    const { profiles, naturalDescription } = await analyzeCharacterImages(referenceImages);

    // Stage 2: Generate scene prompt
    const { prompt, negative_prompt } = await generateScenePrompt(naturalDescription, scenario);

    // Generate images with Imagen (using reference images for consistency)
    const generatedImages = await generateImagesWithImagen({
      prompt,
      negative_prompt,
      referenceImages: referenceImages.map((path, i) => ({
        referenceId: i,
        path,
        config: {
          subject_type: "SUBJECT_TYPE_PERSON",
          subject_description: profiles[i]
        }
      })),
      numberOfImages: 4,
      aspectRatio: "1:1"
    });

    // Stage 3: Select best image
    const { best_image_path, reasoning } = await selectBestCharacterImage(
      referenceImages,
      generatedImages
    );

    // Stage 3.5: Outpaint for wider scene (optional)
    const outpaintedImage = await outpaintImage(best_image_path, prompt);

    // Stage 4: Generate cinematic video prompt
    const videoPrompt = await generateCinematicVideoPrompt(outpaintedImage, scenario);

    // Stage 4.5: Generate video with VEO3
    const video = await generateVeo3Video({
      prompt: videoPrompt,
      referenceImage: outpaintedImage,
      durationSeconds: 8,
      aspectRatio: "16:9",
      enhancePrompt: true,
      personGeneration: "allow_adult"
    });

    return NextResponse.json({
      success: true,
      data: {
        characterProfile: profiles[0],
        scenePrompt: prompt,
        selectedImage: best_image_path,
        selectionReasoning: reasoning,
        videoPrompt,
        videoUrl: video.url
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Genetic Prompt Optimizer (LLM-as-a-Judge)

### Core Concept

**File**: `experiments/veo-genetic-prompt-optimizer/veo_genetic_prompt_optimizer/prompt_optimizer.py`

The genetic algorithm uses **LLMs at every step** instead of traditional genetic operators:

```
Initialize Population → Evaluate Fitness → Select Parents → LLM Mutation/Crossover → Repeat
                              ↓
                    (LLM-as-a-Judge evaluation)
```

### Multi-Objective Fitness Evaluation

**Pattern**: Combine multiple quality metrics with weighted scoring

```python
# Configuration
AUGMENTED_PROMPT_SCORE_WEIGHT = 0.4
METAPROMPT_SCORE_WEIGHT = 0.3
INTENT_PRESERVATION_SCORE_WEIGHT = 0.3

def get_metaprompt_fitness(candidate_metaprompt, base_prompts):
    # Step 1: Evaluate metaprompt instructional quality
    meta_summary, meta_matrix = evaluate_prompts.evaluate_pointwise_batch(
        prompts_data=[{"metaprompt": candidate_metaprompt}],
        metric_name="metaprompt_effectiveness",
        metric_template=METAPROMPT_EFFECTIVENESS_TEMPLATE,
        sampling_count=1  # Can increase for reliability
    )
    metaprompt_score = meta_summary.get("metaprompt_effectiveness/mean", 0.0)

    # Step 2: Generate augmented prompts using the metaprompt
    augmented_prompts = []
    for item in base_prompts:
        full_prompt = f"{candidate_metaprompt}\n\nOriginal: {item['prompt']}\n\nOutput solely the augmented prompt."
        augmented = generate_with_gemini(client, full_prompt, image_path=item.get('image_path'))
        augmented_prompts.append({
            "original_prompt": item['prompt'],
            "augmented_prompt": augmented,
            "image_path": item.get('image_path')
        })

    # Step 3: Evaluate augmented prompt effectiveness
    eff_summary, eff_matrix = evaluate_prompts.evaluate_pointwise_batch(
        prompts_data=augmented_prompts,
        metric_name="veo_effectiveness",
        metric_template=VEO_PROMPT_EFFECTIVENESS_TEMPLATE,
        sampling_count=1
    )
    effectiveness_score = eff_summary.get("veo_effectiveness/mean", 0.0)

    # Step 4: Evaluate intent preservation
    intent_summary, intent_matrix = evaluate_prompts.evaluate_pointwise_batch(
        prompts_data=augmented_prompts,
        metric_name="intent_preservation",
        metric_template=VEO_PROMPT_INTENT_PRESERVATION_TEMPLATE,
        sampling_count=1
    )
    intent_score = intent_summary.get("intent_preservation/mean", 0.0)

    # Step 5: Calculate combined fitness
    combined_score = (
        (AUGMENTED_PROMPT_SCORE_WEIGHT * effectiveness_score) +
        (METAPROMPT_SCORE_WEIGHT * metaprompt_score) +
        (INTENT_PRESERVATION_SCORE_WEIGHT * intent_score)
    )

    return {
        "augmented_prompt_score": effectiveness_score,
        "metaprompt_score": metaprompt_score,
        "intent_preservation_score": intent_score,
        "combined_score": combined_score,
        "augmented_prompts": augmented_prompts
    }
```

### LLM-as-a-Judge Tie-Breaking

**Pattern**: When scores are tied, use LLM for qualitative judgment

```python
def select_parents(client, fitness_results, top_k):
    # Calculate combined scores
    for r in fitness_results:
        r['combined_score'] = (
            (0.4 * r.get('augmented_prompt_score', 0)) +
            (0.3 * r.get('metaprompt_score', 0)) +
            (0.3 * r.get('intent_preservation_score', 0))
        )

    # Sort by combined score
    fitness_results.sort(key=lambda x: x['combined_score'], reverse=True)

    # Check for ties at cutoff
    if len(fitness_results) > top_k:
        score_at_cutoff = fitness_results[top_k - 1]['combined_score']
        score_after_cutoff = fitness_results[top_k]['combined_score']

        if abs(score_at_cutoff - score_after_cutoff) < 1e-9:
            # USE LLM JUDGE for tie-breaking
            candidates = [r for r in fitness_results if r['combined_score'] >= score_at_cutoff]
            selection = _get_selection_from_gemini(client, candidates, top_k)

            # Extract selected parents from judgment
            parents = [find_by_metaprompt(mp) for mp in selection['ranked_parents']]
            best_parent = find_by_metaprompt(selection['best_parent']['metaprompt'])
            best_parent['judgement'] = selection['best_parent']['reasoning']

            return parents, best_parent

    # No tie, return top-k
    return fitness_results[:top_k], fitness_results[0]
```

### LLM Judge Implementation

```python
def _get_selection_from_gemini(client, candidates, top_k):
    """Uses Gemini to qualitatively rank tied candidates"""

    selection_schema = {
        "type": "OBJECT",
        "properties": {
            "ranked_parents": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "rank": {"type": "INTEGER"},
                        "metaprompt": {"type": "STRING"},
                        "reasoning": {"type": "STRING"}
                    }
                },
                "minItems": top_k,
                "maxItems": top_k
            },
            "best_parent": {
                "type": "OBJECT",
                "properties": {
                    "metaprompt": {"type": "STRING"},
                    "reasoning": {"type": "STRING"}
                }
            }
        }
    }

    # Build detailed candidate descriptions
    candidates_text = "\n\n".join([
        f"Metaprompt: \"{c['metaprompt']}\"\n"
        f"  - Combined Score: {c['combined_score']:.3f}\n"
        f"  - Augmented Prompt Feedback: \"{c['augmented_prompt_explanation']}\"\n"
        f"  - Intent Preservation Feedback: \"{c['intent_preservation_explanation']}\"\n"
        f"  - Instructional Quality Feedback: \"{c['metaprompt_explanation']}\""
        for c in candidates
    ])

    judge_prompt = f"""
    You are an expert judge in an evolutionary algorithm. Analyze {len(candidates)} metaprompts
    with similar scores and select the most promising ones.

    **Primary Judging Criteria:**
    1. Intent Preservation: Does it retain every core subject, action, concept?
    2. Detail Enrichment: Does it encourage specific, believable details?
    3. Cinematic Language: Does it guide use of camera angles, composition, movement?

    **Candidates:**
    {candidates_text}

    **Decision:**
    Provide ranked list of top {top_k} metaprompts and identify the single best parent.
    """

    response = generate_with_gemini(client, judge_prompt, response_schema=selection_schema)
    return json.loads(response)
```

### Next.js Adaptation

```typescript
// services/llm-judge.ts
interface CandidateMetaprompt {
  metaprompt: string;
  combined_score: number;
  augmented_prompt_explanation: string;
  intent_preservation_explanation: string;
  metaprompt_explanation: string;
}

interface JudgeSelection {
  ranked_parents: Array<{
    rank: number;
    metaprompt: string;
    reasoning: string;
  }>;
  best_parent: {
    metaprompt: string;
    reasoning: string;
  };
}

async function selectParentsWithJudge(
  candidates: CandidateMetaprompt[],
  topK: number
): Promise<JudgeSelection> {
  const candidatesText = candidates.map(c => `
    Metaprompt: "${c.metaprompt}"
      - Combined Score: ${c.combined_score.toFixed(3)}
      - Augmented Prompt Feedback: "${c.augmented_prompt_explanation}"
      - Intent Preservation Feedback: "${c.intent_preservation_explanation}"
      - Instructional Quality Feedback: "${c.metaprompt_explanation}"
  `).join('\n\n');

  const judgePrompt = `
    You are an expert judge. Analyze ${candidates.length} metaprompts with similar scores.

    **Judging Criteria:**
    1. Intent Preservation: Retains every core subject, action, concept?
    2. Detail Enrichment: Encourages specific, believable details?
    3. Cinematic Language: Guides camera angles, composition, movement?

    **Candidates:**
    ${candidatesText}

    **Decision:**
    Provide ranked list of top ${topK} and identify single best parent.
  `;

  const response = await gemini.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ text: judgePrompt }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          ranked_parents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                rank: { type: "number" },
                metaprompt: { type: "string" },
                reasoning: { type: "string" }
              },
              required: ["rank", "metaprompt", "reasoning"]
            },
            minItems: topK,
            maxItems: topK
          },
          best_parent: {
            type: "object",
            properties: {
              metaprompt: { type: "string" },
              reasoning: { type: "string" }
            },
            required: ["metaprompt", "reasoning"]
          }
        },
        required: ["ranked_parents", "best_parent"]
      }
    }
  });

  return JSON.parse(response.text);
}
```

### LLM-Driven Mutation & Crossover

**Pattern**: Use evaluation feedback to guide genetic operations

```python
# MUTATION: Refine single parent based on feedback
def mutate_metaprompt(parent, video_feedback):
    mutation_prompt = f"""
    You are a Metaprompt Optimizer. Refine based on evaluation feedback.

    Parent Metaprompt: "{parent['metaprompt']}"

    Augmented Prompt Feedback: "{parent['augmented_prompt_explanation']}"
    Intent Preservation Feedback: "{parent['intent_preservation_explanation']}"
    Instructional Quality Feedback: "{parent['metaprompt_explanation']}"
    Video Evaluation Feedback: "{video_feedback}"

    Generate one improved metaprompt that fixes weaknesses and enhances strengths.
    Consider all feedback. Reference the official Veo prompting guide.

    Output only the new metaprompt text.
    """

    return generate_with_gemini(client, mutation_prompt)

# CROSSOVER: Combine two parents
def crossover_metaprompts(parent1, parent2, video_feedback):
    crossover_prompt = f"""
    You are a Metaprompt Optimizer. Combine strengths of two metaprompts.

    Metaprompt A: "{parent1['metaprompt']}"
      - Augmented Prompt Feedback: "{parent1['augmented_prompt_explanation']}"
      - Intent Feedback: "{parent1['intent_preservation_explanation']}"
      - Instructional Feedback: "{parent1['metaprompt_explanation']}"

    Metaprompt B: "{parent2['metaprompt']}"
      - Augmented Prompt Feedback: "{parent2['augmented_prompt_explanation']}"
      - Intent Feedback: "{parent2['intent_preservation_explanation']}"
      - Instructional Feedback: "{parent2['metaprompt_explanation']}"

    Video Evaluation Feedback: "{video_feedback}"

    Generate hybrid metaprompt merging best qualities of both.
    Reference the official Veo prompting guide.

    Output only the new metaprompt text.
    """

    return generate_with_gemini(client, crossover_prompt)
```

**Next.js Implementation**:
```typescript
async function mutateMetaprompt(parent: CandidateMetaprompt, videoFeedback: string) {
  const mutationPrompt = `
    You are a Metaprompt Optimizer. Refine based on evaluation feedback.

    Parent: "${parent.metaprompt}"
    Augmented Prompt Feedback: "${parent.augmented_prompt_explanation}"
    Intent Preservation Feedback: "${parent.intent_preservation_explanation}"
    Instructional Quality Feedback: "${parent.metaprompt_explanation}"
    Video Feedback: "${videoFeedback}"

    Generate improved metaprompt fixing weaknesses, enhancing strengths.
    Output only the new metaprompt text.
  `;

  const response = await gemini.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ text: mutationPrompt }],
    generationConfig: { temperature: 0.7 }
  });

  return response.text.trim();
}

async function crossoverMetaprompts(
  parent1: CandidateMetaprompt,
  parent2: CandidateMetaprompt,
  videoFeedback: string
) {
  const crossoverPrompt = `
    Combine strengths of two metaprompts.

    Metaprompt A: "${parent1.metaprompt}"
      - Feedback: Aug: "${parent1.augmented_prompt_explanation}",
                  Intent: "${parent1.intent_preservation_explanation}"

    Metaprompt B: "${parent2.metaprompt}"
      - Feedback: Aug: "${parent2.augmented_prompt_explanation}",
                  Intent: "${parent2.intent_preservation_explanation}"

    Video Feedback: "${videoFeedback}"

    Generate hybrid metaprompt merging best qualities.
    Output only the new metaprompt text.
  `;

  const response = await gemini.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ text: crossoverPrompt }],
    generationConfig: { temperature: 0.8 }
  });

  return response.text.trim();
}
```

---

## Configuration Patterns

### Environment-Based Configuration

**File**: `experiments/veo3-character-consistency/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Project configuration
PROJECT_ID = os.getenv("PROJECT_ID")
GEMINI_LOCATION = os.getenv("GEMINI_LOCATION")
IMAGEN_LOCATION = os.getenv("IMAGEN_LOCATION")
VEO_LOCATION = os.getenv("VEO_LOCATION")

# Directory configuration
INPUT_DIR = os.getenv("INPUT_DIR")
OUTPUT_DIR = os.getenv("OUTPUT_DIR")

# Model configuration
MULTIMODAL_MODEL_NAME = "gemini-2.5-pro"
VEO_MODEL_NAME = "veo-3.0-generate-preview"
IMAGEN_MODEL_NAME = "imagen-3.0-capability-001"
```

**Next.js Pattern**:
```typescript
// config/vertex-ai.ts
export const vertexAIConfig = {
  project: {
    id: process.env.GCP_PROJECT_ID!,
    locations: {
      gemini: process.env.GEMINI_LOCATION || "us-central1",
      imagen: process.env.IMAGEN_LOCATION || "us-central1",
      veo: process.env.VEO_LOCATION || "us-central1"
    }
  },
  models: {
    multimodal: "gemini-2.5-pro",
    veo: "veo-3.0-generate-preview",
    imagen: "imagen-3.0-capability-001"
  },
  directories: {
    input: process.env.INPUT_DIR || "./input",
    output: process.env.OUTPUT_DIR || "./output"
  }
} as const;

// Validation
const requiredEnvVars = ['GCP_PROJECT_ID', 'GEMINI_LOCATION'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### Optimizer Configuration with Constants

**File**: `experiments/veo-genetic-prompt-optimizer/veo_genetic_prompt_optimizer/prompt_optimizer.py:25-36`

```python
# Genetic Algorithm Configuration
NUM_GENERATIONS = 5
POPULATION_SIZE = 10
TOP_K_SELECTION = 2

# Fitness Weight Configuration
AUGMENTED_PROMPT_SCORE_WEIGHT = 0.4
METAPROMPT_SCORE_WEIGHT = 0.3
INTENT_PRESERVATION_SCORE_WEIGHT = 0.3

# Feature Flags
ENABLE_VIDEO_FEEDBACK = False  # Expensive operation, disabled by default
```

**Next.js Pattern**:
```typescript
// config/optimizer.ts
export const optimizerConfig = {
  algorithm: {
    numGenerations: 5,
    populationSize: 10,
    topKSelection: 2
  },
  fitness: {
    weights: {
      augmentedPrompt: 0.4,
      metaprompt: 0.3,
      intentPreservation: 0.3
    }
  },
  features: {
    enableVideoFeedback: false,  // Expensive, disabled by default
    enableParallelProcessing: true
  },
  models: {
    evaluator: "gemini-2.5-flash-lite",
    generator: "gemini-2.5-pro",
    judge: "gemini-2.5-flash-lite"
  }
} as const;

// Type-safe access
type OptimizerConfig = typeof optimizerConfig;
```

---

## Quality Assessment Patterns

### Evaluation Template System

**File**: `experiments/veo-genetic-prompt-optimizer/veo_genetic_prompt_optimizer/veo_prompt_eval_templates.py`

The evaluation system uses **templated rubrics** with structured scoring:

```python
METAPROMPT_EFFECTIVENESS_TEMPLATE = """
# Instruction
You are an expert in prompt engineering. Evaluate a **metaprompt** (instructions for AI to rewrite prompts).

# Evaluation
## Metric Definition
Assess **Metaprompt Effectiveness**: How well it guides AI to produce quality video prompts.

## Criteria
1. **Guidance on Core Goal**: Clearly defines objective (enhance quality while preserving intent)?
2. **Guidance on Subject Detailing**:
   - Adds specific characteristics (hairstyle, expression, clothing)?
   - Provides nuanced diversity rules (ethnicity, gender)?
3. **Guidance on Cinematic Enhancement**:
   - Lists wide range of visual details (camera, lighting, motion, style)?
   - Promotes quality identifiers ('cinematic shot', 'award winning')?
4. **Guidance on Constraint Handling**:
   - Emphasizes preserving every original detail?
   - Provides rules for long/detailed/non-visual queries?
   - Includes constraints (avoid minors, emphasize key features)?
5. **Overall Clarity**: Well-organized, clear, unambiguous? Provides examples?

## Rating Rubric
**5 (Excellent)**: Exceptionally clear, comprehensive. Strong explicit guidance on all components.
**4 (Good)**: Clear, effective. Good guidance on most, slightly less specific in one area.
**3 (Adequate)**: Understandable but lacks depth. General without necessary specificity.
**2 (Poor)**: Vague or simplistic. Lacks clear instructions on most components.
**1 (Very Poor)**: Highly ambiguous, contradictory, incomplete.

## Evaluation Steps
STEP 1: Assess Core Goal clarity
STEP 2: Evaluate Subject Detailing depth and nuance
STEP 3: Analyze Cinematic Enhancement comprehensiveness
STEP 4: Scrutinize Constraint Handling robustness
STEP 5: Judge Overall Clarity and Structure
STEP 6: Assign rating with detailed rationale

# Metaprompt to Evaluate
{metaprompt}
"""
```

**Next.js Pattern**:
```typescript
// services/evaluation-templates.ts
export const evaluationTemplates = {
  metapromptEffectiveness: (metaprompt: string) => `
    # Instruction
    You are an expert in prompt engineering. Evaluate this metaprompt.

    # Evaluation
    ## Metric Definition
    Assess **Metaprompt Effectiveness**: How well it guides AI to produce quality prompts.

    ## Criteria
    1. **Core Goal Guidance**: Clearly defines objective?
    2. **Subject Detailing**: Adds specific characteristics? Diversity rules?
    3. **Cinematic Enhancement**: Lists visual details (camera, lighting, style)?
    4. **Constraint Handling**: Preserves original? Rules for edge cases?
    5. **Overall Clarity**: Well-organized? Provides examples?

    ## Rating Rubric
    5 (Excellent): Exceptionally clear, comprehensive
    4 (Good): Clear, effective, slightly less specific in one area
    3 (Adequate): Understandable but lacks depth
    2 (Poor): Vague or simplistic
    1 (Very Poor): Ambiguous, contradictory, incomplete

    ## Evaluation Steps
    STEP 1: Assess Core Goal clarity
    STEP 2: Evaluate Subject Detailing
    STEP 3: Analyze Cinematic Enhancement
    STEP 4: Scrutinize Constraint Handling
    STEP 5: Judge Overall Clarity
    STEP 6: Assign rating with rationale

    # Metaprompt to Evaluate
    ${metaprompt}
  `,

  promptEffectiveness: (prompt: string, original: string) => `
    # Instruction
    Evaluate rewritten prompt quality for video generation.

    # Evaluation
    ## Metric Definition
    Assess effectiveness for Veo video generation model.

    ## Criteria
    1. **Visual Detail**: Rich, specific visual descriptions?
    2. **Cinematic Language**: Camera angles, lighting, composition?
    3. **Intent Preservation**: Retains all core elements from original?
    4. **Coherence**: Cohesive, executable prompt?

    ## Rating Rubric
    5 (Excellent): Rich detail, strong cinematic language, perfect preservation
    4 (Good): Strong in most areas, minor gaps
    3 (Adequate): Meets basics but lacks depth
    2 (Poor): Missing key elements or details
    1 (Very Poor): Fails to preserve intent or provide detail

    # Original Prompt
    ${original}

    # Rewritten Prompt to Evaluate
    ${prompt}
  `
};

// Usage
async function evaluateMetaprompt(metaprompt: string) {
  const response = await gemini.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ text: evaluationTemplates.metapromptEffectiveness(metaprompt) }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: { type: "number", minimum: 1, maximum: 5 },
          explanation: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } }
        },
        required: ["score", "explanation"]
      }
    }
  });

  return JSON.parse(response.text);
}
```

### Reliability Techniques

**Pattern**: Sampling and positional bias mitigation

```python
# SAMPLING COUNT: Multiple evaluations for reliability
def evaluate_pointwise_batch(prompts_data, metric_name, metric_template, sampling_count=3):
    """
    Execute multiple independent evaluations and average scores.
    Higher sampling_count = more reliable but more expensive.
    """
    all_scores = []

    for _ in range(sampling_count):
        result = vertex_ai_eval_service.evaluate(
            prompts=prompts_data,
            metric=metric_name,
            template=metric_template
        )
        all_scores.append(result['scores'])

    # Average across all sampling runs
    avg_scores = np.mean(all_scores, axis=0)
    return avg_scores

# FLIP ENABLED: Counteract positional bias in pairwise comparisons
def evaluate_video_pair(video_a, video_b, flip_enabled=True):
    """
    Randomly flip order of videos to eliminate positional bias.
    """
    evaluations = []

    for i in range(sampling_count):
        # Randomly determine order
        if flip_enabled and random.random() < 0.5:
            result = evaluate_pair(video_b, video_a)  # Flipped
            result['flipped'] = True
        else:
            result = evaluate_pair(video_a, video_b)  # Original order
            result['flipped'] = False

        evaluations.append(result)

    # Aggregate results accounting for flips
    return aggregate_pairwise_results(evaluations)
```

**Next.js Pattern**:
```typescript
// services/reliable-evaluation.ts
interface EvaluationResult {
  score: number;
  explanation: string;
}

async function evaluateWithSampling(
  prompt: string,
  template: string,
  samplingCount: number = 3
): Promise<EvaluationResult> {
  const results = await Promise.all(
    Array(samplingCount).fill(null).map(() =>
      gemini.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ text: template }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "number" },
              explanation: { type: "string" }
            }
          }
        }
      }).then(r => JSON.parse(r.text))
    )
  );

  // Average scores for reliability
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const explanations = results.map(r => r.explanation).join(' | ');

  return {
    score: avgScore,
    explanation: explanations
  };
}

async function evaluateVideoPairWithFlip(
  videoA: string,
  videoB: string,
  samplingCount: number = 3
): Promise<{ winner: 'A' | 'B', reasoning: string }> {
  const evaluations = await Promise.all(
    Array(samplingCount).fill(null).map(async () => {
      const flipped = Math.random() < 0.5;
      const [first, second] = flipped ? [videoB, videoA] : [videoA, videoB];

      const result = await gemini.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          { text: "Which video better realizes the prompt?" },
          { text: "Video 1:" },
          { fileData: { fileUri: first, mimeType: "video/mp4" } },
          { text: "Video 2:" },
          { fileData: { fileUri: second, mimeType: "video/mp4" } }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              better_video: { type: "string", enum: ["1", "2"] },
              reasoning: { type: "string" }
            }
          }
        }
      });

      const parsed = JSON.parse(result.text);

      // Adjust for flip
      const actualWinner = flipped
        ? (parsed.better_video === "1" ? "B" : "A")
        : (parsed.better_video === "1" ? "A" : "B");

      return { winner: actualWinner, reasoning: parsed.reasoning };
    })
  );

  // Majority vote
  const votes = evaluations.reduce((acc, e) => {
    acc[e.winner] = (acc[e.winner] || 0) + 1;
    return acc;
  }, {} as Record<'A' | 'B', number>);

  const winner = votes.A > votes.B ? 'A' : 'B';
  const reasoning = evaluations.map(e => e.reasoning).join(' | ');

  return { winner, reasoning };
}
```

---

## Error Handling & Reliability

### Exponential Backoff with Retry

**File**: `experiments/veo-genetic-prompt-optimizer/veo_genetic_prompt_optimizer/prompt_optimizer.py:46-63`

```python
def _generate_content_with_retry(client, *args, **kwargs):
    """Wrapper for generate_content with exponential backoff"""
    max_retries = 5
    base_delay = 2

    for n in range(max_retries):
        try:
            return client.models.generate_content(*args, **kwargs)
        except Exception as e:
            if "resource exhausted" in str(e).lower():
                if n < max_retries - 1:
                    # Exponential backoff with jitter
                    delay = base_delay * (2**n) + random.uniform(0, 1)
                    print(f"Resource exhausted. Retrying in {delay:.2f}s...")
                    time.sleep(delay)
                else:
                    print("Max retries reached. Raising exception.")
                    raise e
            else:
                raise e
```

**Next.js Pattern**:
```typescript
// utils/retry.ts
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isResourceExhausted = error.message?.toLowerCase().includes('resource exhausted');
      const isLastAttempt = attempt === maxRetries - 1;

      if (isResourceExhausted && !isLastAttempt) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Resource exhausted. Retrying in ${(delay / 1000).toFixed(2)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const response = await withExponentialBackoff(() =>
  gemini.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ text: prompt }]
  })
);
```

### Graceful Degradation

**Pattern**: Fallback to simpler methods when LLM judge fails

```python
def _get_selection_from_gemini(client, candidates, top_k):
    try:
        response_text = generate_with_gemini(client, judge_prompt, response_schema=selection_schema)
        return json.loads(response_text)
    except (json.JSONDecodeError, TypeError):
        print("Gemini judge failed. Falling back to random selection.")
        selected = random.sample(candidates, top_k)
        best = random.choice(selected)
        return {
            "ranked_parents": [
                {"metaprompt": p["metaprompt"], "reasoning": "Random fallback"}
                for p in selected
            ],
            "best_parent": {
                "metaprompt": best["metaprompt"],
                "reasoning": "Random fallback due to JSON error"
            }
        }
```

**Next.js Pattern**:
```typescript
async function selectParentsWithFallback(
  candidates: Candidate[],
  topK: number
): Promise<Selection> {
  try {
    // Attempt LLM judge
    return await selectParentsWithJudge(candidates, topK);
  } catch (error) {
    console.warn('LLM judge failed, falling back to score-based selection:', error);

    // Fallback: Sort by score
    const sorted = [...candidates].sort((a, b) => b.combined_score - a.combined_score);
    const selected = sorted.slice(0, topK);

    return {
      ranked_parents: selected.map((p, i) => ({
        rank: i + 1,
        metaprompt: p.metaprompt,
        reasoning: "Score-based selection (LLM judge unavailable)"
      })),
      best_parent: {
        metaprompt: selected[0].metaprompt,
        reasoning: "Highest combined score (LLM judge unavailable)"
      }
    };
  }
}
```

### Parallel Processing with Error Isolation

**File**: `experiments/veo-genetic-prompt-optimizer/veo_genetic_prompt_optimizer/prompt_optimizer.py:442-458`

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

evaluated_candidates = []
with ThreadPoolExecutor() as executor:
    future_to_candidate = {
        executor.submit(get_metaprompt_fitness, client, candidate['metaprompt'], base_prompts): candidate
        for candidate in population
    }

    for future in as_completed(future_to_candidate):
        candidate = future_to_candidate[future]
        try:
            fitness_data = future.result()
            if fitness_data:
                candidate.update(fitness_data)
                evaluated_candidates.append(candidate)
        except Exception as exc:
            print(f"'{candidate.get('metaprompt', 'Unknown')}' generated exception: {exc}")
            # Continue with other candidates instead of failing entire generation
            pass

if not evaluated_candidates:
    print("No metaprompts successfully evaluated. Stopping.")
    break
```

**Next.js Pattern**:
```typescript
async function evaluatePopulationInParallel(
  population: Metaprompt[],
  basePrompts: Prompt[]
): Promise<EvaluatedCandidate[]> {
  const evaluations = await Promise.allSettled(
    population.map(candidate =>
      evaluateMetapromptFitness(candidate.metaprompt, basePrompts)
    )
  );

  const successful = evaluations
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          ...population[index],
          ...result.value
        };
      } else {
        console.error(`Evaluation failed for metaprompt ${index}:`, result.reason);
        return null;
      }
    })
    .filter((candidate): candidate is EvaluatedCandidate => candidate !== null);

  if (successful.length === 0) {
    throw new Error('No metaprompts were successfully evaluated');
  }

  console.log(`Successfully evaluated ${successful.length}/${population.length} candidates`);
  return successful;
}
```

---

## Next.js Adaptation Strategies

### API Route Architecture

```typescript
// app/api/veo/character-consistency/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CharacterConsistencyPipeline } from '@/services/character-consistency';

export const maxDuration = 300; // 5 minutes for video generation

export async function POST(req: NextRequest) {
  try {
    const { referenceImages, scenario, options } = await req.json();

    const pipeline = new CharacterConsistencyPipeline();

    const result = await pipeline.execute({
      referenceImages,
      scenario,
      options: {
        numberOfImages: options?.numberOfImages || 4,
        aspectRatio: options?.aspectRatio || "1:1",
        videoDuration: options?.videoDuration || 8,
        enableOutpainting: options?.enableOutpainting ?? true
      }
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Character consistency pipeline error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// app/api/veo/prompt-optimizer/route.ts
export async function POST(req: NextRequest) {
  try {
    const { basePrompts, config } = await req.json();

    const optimizer = new GeneticPromptOptimizer({
      numGenerations: config?.numGenerations || 5,
      populationSize: config?.populationSize || 10,
      topKSelection: config?.topKSelection || 2
    });

    // Stream progress updates
    const stream = new ReadableStream({
      async start(controller) {
        for await (const update of optimizer.evolve(basePrompts)) {
          controller.enqueue(JSON.stringify(update) + '\n');
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Service Layer Pattern

```typescript
// services/character-consistency.ts
import { VertexAI } from '@google-cloud/vertexai';

export class CharacterConsistencyPipeline {
  private gemini: VertexAI;
  private imagen: ImagenClient;
  private veo: VeoClient;

  constructor() {
    this.gemini = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: process.env.GEMINI_LOCATION!
    });
    // Initialize other clients...
  }

  async execute(params: {
    referenceImages: string[];
    scenario: string;
    options: PipelineOptions;
  }) {
    // Stage 1: Analyze images
    const { profiles, description } = await this.analyzeCharacterImages(params.referenceImages);

    // Stage 2: Generate scene prompt
    const { prompt, negative_prompt } = await this.generateScenePrompt(description, params.scenario);

    // Stage 3: Generate & select best image
    const generatedImages = await this.generateImages(prompt, negative_prompt, params.referenceImages);
    const { best_image_path, reasoning } = await this.selectBestImage(params.referenceImages, generatedImages);

    // Stage 3.5: Outpaint (optional)
    const finalImage = params.options.enableOutpainting
      ? await this.outpaintImage(best_image_path, prompt)
      : best_image_path;

    // Stage 4: Generate video
    const videoPrompt = await this.generateVideoPrompt(finalImage, params.scenario);
    const video = await this.generateVideo(videoPrompt, finalImage, params.options);

    return {
      characterProfile: profiles[0],
      scenePrompt: prompt,
      selectedImage: best_image_path,
      selectionReasoning: reasoning,
      videoPrompt,
      videoUrl: video.url
    };
  }

  private async analyzeCharacterImages(imagePaths: string[]) {
    // Implementation from Stage 1 pattern above
  }

  private async generateScenePrompt(description: string, scenario: string) {
    // Implementation from Stage 2 pattern above
  }

  // ... other methods
}
```

### React Hook Pattern

```typescript
// hooks/use-character-video.ts
import { useState } from 'react';

interface UseCharacterVideoOptions {
  onProgress?: (stage: string, progress: number) => void;
}

export function useCharacterVideo(options?: UseCharacterVideoOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<CharacterVideoResult | null>(null);

  const generate = async (params: {
    referenceImages: File[];
    scenario: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      // Upload images
      options?.onProgress?.('Uploading images', 0.1);
      const imageUrls = await uploadImages(params.referenceImages);

      // Generate video
      options?.onProgress?.('Analyzing character', 0.3);
      const response = await fetch('/api/veo/character-consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImages: imageUrls,
          scenario: params.scenario
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setResult(data.data);
      options?.onProgress?.('Complete', 1.0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, result };
}

// Usage in component
function CharacterVideoGenerator() {
  const { generate, loading, error, result } = useCharacterVideo({
    onProgress: (stage, progress) => {
      console.log(`${stage}: ${(progress * 100).toFixed(0)}%`);
    }
  });

  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

### Streaming Progress Updates

```typescript
// app/api/veo/optimize-prompts/route.ts
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const { basePrompts, config } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      const optimizer = new GeneticPromptOptimizer(config);

      try {
        for await (const update of optimizer.evolve(basePrompts)) {
          const message = encoder.encode(
            `data: ${JSON.stringify(update)}\n\n`
          );
          controller.enqueue(message);
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Client-side consumption
async function optimizePrompts(basePrompts: string[]) {
  const response = await fetch('/api/veo/optimize-prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ basePrompts })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        console.log('Progress update:', data);
        // Update UI with generation progress
      }
    }
  }
}
```

---

## Summary & Key Takeaways

### 1. **Multi-Stage Workflows Are Powerful**
- **Character Consistency**: 4-stage pipeline with progressive refinement
- **Each stage validates and improves** the previous output
- **Next.js**: Implement as service classes with async/await chains

### 2. **LLM-as-a-Judge is Game-Changing**
- **Replace traditional algorithms** with LLM reasoning
- **Use for**: Tie-breaking, quality assessment, genetic operations
- **Reliability**: Sampling + flip-enabled comparisons

### 3. **Structured Outputs with JSON Schema**
- **Always use JSON schema** for programmatic outputs
- **Enables type-safety** in TypeScript/Next.js
- **Pydantic models → TypeScript interfaces** mapping

### 4. **Error Handling is Critical**
- **Exponential backoff** for rate limits
- **Graceful degradation** with fallbacks
- **Parallel processing** with error isolation

### 5. **Configuration Patterns**
- **Environment-based** with validation
- **Type-safe constants** for algorithm parameters
- **Feature flags** for expensive operations

### 6. **Evaluation Templates**
- **Structured rubrics** with clear criteria
- **Step-by-step evaluation** process
- **Reusable across different metrics**

---

**Sign off as SmokeDev 🚬**
