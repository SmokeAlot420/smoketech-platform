/**
 * ZHO Advanced NanoBanana Techniques Engine
 * Based on ZHO-ZHO-ZHO's 46 viral creation techniques
 * Ultra-realistic image generation and transformation patterns
 */

export interface ZHOTechnique {
  id: number;
  name: string;
  category: 'transformation' | 'character' | 'photography' | 'design' | 'viral' | 'enhancement';
  viralPotential: 'high' | 'medium' | 'low';
  description: string;
  prompt: string;
  difficulty: 'simple' | 'medium' | 'complex';
  requirements?: string[];
  examples?: string[];
  originalSource?: string;
}

export class ZHOTechniquesEngine {

  private techniques: ZHOTechnique[] = [
    {
      id: 1,
      name: 'Image to Figure/Toy (Viral)',
      category: 'viral',
      viralPotential: 'high',
      description: 'Transform any image into a collectible figure with packaging - ZHO\'s most viral technique',
      prompt: 'turn this photo into a character figure. Behind it, place a box with the character\'s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible',
      difficulty: 'simple',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1958539464994959715'
    },
    {
      id: 2,
      name: 'Ultra-Realistic Portrait Generation',
      category: 'photography',
      viralPotential: 'high',
      description: 'Generate hyper-realistic portraits with detailed photography descriptions',
      prompt: '画面采用中景近乎半身的构图，镜头与人物几乎平视，但透视感强烈，但因为主体微微前倾，视觉上产生一种略带俯视感的压缩效果，让观者与模特之间的距离显得亲密而直接。人物微微抬头冲向镜头，有种拽姐的感觉。闪光灯从正面偏左上方打来，制造出硬朗的高光与深重阴影——墨镜镜片上有明显高光反射，人物后方墙面出现淡淡的投影，整体呈现典型的"直闪"质感：颗粒感轻微，可见胶片风格或高感光度数码拍摄的粗粝纹理。人物面部稍稍有点过度曝光',
      difficulty: 'complex',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1957754813585977533'
    },
    {
      id: 3,
      name: 'Character Video Generation (Preserve Features)',
      category: 'character',
      viralPotential: 'high',
      description: 'Generate video maintaining exact facial features across camera angles',
      prompt: 'change the Camera anglo a high-angled selfie perspective looking down at the woman, while preserving her exact facial features, expression, and clothing, Maintain the same living room interior background with the sofa, natural lighting, and overall photographic composition and style.',
      difficulty: 'medium',
      requirements: ['Reference image with character'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1958194019223187870'
    },
    {
      id: 4,
      name: 'Architecture to Model Transformation',
      category: 'transformation',
      viralPotential: 'medium',
      description: 'Convert architectural photos into 3D models with context',
      prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1958752034791809071'
    },
    {
      id: 5,
      name: 'Continuous Editing + Object Combination',
      category: 'enhancement',
      viralPotential: 'medium',
      description: 'Multi-step editing process for complex transformations',
      prompt: 'Step 1: 图一人物背上图二 logo 的斜挎包\nStep 2: 换上 Y2K 风格的背景\nStep 3 (VEO3): 女孩转过身来摆出一个可爱帅气的pose，背景音乐也是y2k风格',
      difficulty: 'complex',
      requirements: ['Multiple reference images', 'VEO3 for video'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960382829852082269'
    },
    {
      id: 6,
      name: 'High-Resolution Restoration',
      category: 'enhancement',
      viralPotential: 'low',
      description: 'Simple but effective image quality enhancement',
      prompt: 'Enhance this image to high resolution',
      difficulty: 'simple',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960398697424142518'
    },
    {
      id: 7,
      name: 'Object Combination/Version Comparison',
      category: 'enhancement',
      viralPotential: 'low',
      description: 'Combine multiple objects into single composition',
      prompt: '把它们组合起来',
      difficulty: 'simple',
      requirements: ['Multiple source images'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960402871780040934'
    },
    {
      id: 8,
      name: 'Product Advertisement Generation',
      category: 'design',
      viralPotential: 'medium',
      description: 'Create product advertisements with specific models',
      prompt: 'Image: 模特拿着香水｜The model is holding a perfume\nVideo: 模特展示香水，配上优美的音乐｜The model is showcasing the perfume with beautiful music',
      difficulty: 'medium',
      requirements: ['Model image', 'Product image'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960411819929166108'
    },
    {
      id: 9,
      name: 'Person Extraction from Crowds + HD',
      category: 'enhancement',
      viralPotential: 'medium',
      description: 'Extract specific person from crowd and enhance to HD',
      prompt: 'Separate the person inside the green box and turn it into a high-definition single-person photo',
      difficulty: 'medium',
      requirements: ['Marked area in image'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960642723456934071'
    },
    {
      id: 10,
      name: 'Line Art + Color Card Coloring',
      category: 'transformation',
      viralPotential: 'medium',
      description: 'Convert to line art then apply specific color schemes',
      prompt: 'Step 1: 变成线稿手绘图\nStep 2: 准确使用色卡为图二人物上色',
      difficulty: 'medium',
      requirements: ['Color reference card'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960652077891510752'
    },
    {
      id: 11,
      name: 'Character Design Sheet Generation',
      category: 'character',
      viralPotential: 'high',
      description: 'Generate complete character design documentation',
      prompt: '为我生成人物的角色设定（Character Design）\n比例设定（不同身高对比、头身比等）\n三视图（正面、侧面、背面）\n表情设定（Expression Sheet）\n动作设定（Pose Sheet） → 各种常见姿势\n服装设定（Costume Design）',
      difficulty: 'complex',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960669234276753542'
    },
    {
      id: 12,
      name: 'Cross-Dimensional Character Integration',
      category: 'character',
      viralPotential: 'high',
      description: 'Insert illustrated characters into real environments',
      prompt: '在图中加上一对情侣坐在座位上开心的喝咖啡和交谈，人物都是粗线稿可爱插画风格',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960682436867580149'
    },
    {
      id: 13,
      name: 'Character + Design Experience Rendering',
      category: 'design',
      viralPotential: 'medium',
      description: 'Replace characters and design elements in scenes',
      prompt: '把人物换成图二人物，沙发换成图三沙发，配色换成橙色，文字换成"Z"',
      difficulty: 'medium',
      requirements: ['Character reference', 'Design elements'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960737047297319055'
    },
    {
      id: 14,
      name: 'Precise Video Character Replacement',
      category: 'character',
      viralPotential: 'high',
      description: 'Replace specific characters in video content',
      prompt: 'Image: 把左边第二位人物换成希斯莱杰小丑/上传照片人物\nVideo: 小丑左右看了看，走向镜头前',
      difficulty: 'complex',
      requirements: ['Video content', 'Character reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960939326961017303'
    },
    {
      id: 15,
      name: 'Anime to Real-Life (1:1 Restoration)',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Convert anime/illustration to photorealistic human',
      prompt: 'Generate a highly detailed photo of a girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation',
      difficulty: 'complex',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1960960372078469426'
    },
    {
      id: 16,
      name: 'Professional Photography with Pose Reference',
      category: 'photography',
      viralPotential: 'medium',
      description: 'Apply professional photography to character with specific pose',
      prompt: '图一人物换成图二姿势，专业摄影棚拍摄',
      difficulty: 'medium',
      requirements: ['Character image', 'Pose reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961024423596872184'
    },
    {
      id: 17,
      name: 'Image to Action Figure',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform person into detailed action figure with accessories',
      prompt: 'Transform the the person in the photo into an action figure, styled after [CHARACTER_NAME] from [SOURCE / CONTEXT]. Next to the figure, display the accessories including [ITEM_1], [ITEM_2], and [ITEM_3]. On the top of the toy box, write "[BOX_LABEL_TOP]", and underneath it, "[BOX_LABEL_BOTTOM]". Place the box in a [BACKGROUND_SETTING] environment. Visualize this in a highly realistic way with attention to fine details.',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961380347977044445'
    },
    {
      id: 18,
      name: 'Image to Funko Pop Figure',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform person into Funko Pop style with packaging',
      prompt: 'Transform the person in the photo into the style of a Funko Pop figure packaging box, presented in an isometric perspective. Label the packaging with the title \'ZHOGUE\'. Inside the box, showcase the figure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others). Next to the box, also display the actual figure itself outside of the packaging, rendered in a realistic and lifelike style.',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961390556875297202'
    },
    {
      id: 19,
      name: 'Image to LEGO Minifigure',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform person into LEGO minifigure with packaging',
      prompt: 'Transform the person in the photo into the style of a LEGO minifigure packaging box, presented in an isometric perspective. Label the packaging with the title \'ZHOGUE\'. Inside the box, showcase the LEGO minifigure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others) as LEGO accessories. Next to the box, also display the actual LEGO minifigure itself outside of the packaging, rendered in a realistic and lifelike style.',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961395526198595771'
    },
    {
      id: 20,
      name: 'Image to Knitted Doll',
      category: 'transformation',
      viralPotential: 'medium',
      description: 'Transform person into handmade crocheted yarn doll',
      prompt: 'A close-up, professionally composed photograph showing a handmade crocheted yarn doll being gently held in both hands. The doll has a rounded shape and an adorable chibi-style appearance, with vivid color contrasts and rich details. The hands holding the doll appear natural and tender, with clearly visible finger posture, and the skin texture and light-shadow transitions look soft and realistic, conveying a warm, tangible touch. The background is slightly blurred, depicting an indoor setting with a warm wooden tabletop and natural light streaming in through a window, creating a cozy and intimate atmosphere. The overall image conveys a sense of exquisite craftsmanship and a cherished, heartwarming emotion.',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961401243269542049'
    },
    {
      id: 21,
      name: 'Image to Barbie Doll',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform person into Barbie doll with official packaging',
      prompt: 'Transform the person in the photo into the style of a Barbie doll packaging box, presented in an isometric perspective. Label the packaging with the title \'ZHOGUE\'. Inside the box, showcase the Barbie doll version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) designed as stylish Barbie accessories. Next to the box, also display the actual Barbie doll itself outside of the packaging, rendered in a realistic and lifelike style, resembling official Barbie promotional renders',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961403360726409293'
    },
    {
      id: 22,
      name: 'Image to Gundam Model Kit',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform person into Gundam-style mecha figure',
      prompt: 'Transform the person in the photo into the style of a Gundam model kit packaging box, presented in an isometric perspective. Label the packaging with the title \'ZHOGUE\'. Inside the box, showcase a Gundam-style mecha version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) redesigned as futuristic mecha accessories. The packaging should resemble authentic Gunpla boxes, with technical illustrations, instruction-manual style details, and sci-fi typography. Next to the box, also display the actual Gundam-style mecha figure itself outside of the packaging, rendered in a realistic and lifelike style, similar to official Bandai promotional renders.',
      difficulty: 'complex',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961412823340265509'
    },
    {
      id: 23,
      name: 'Cyber Baby Generation (Two Faces)',
      category: 'character',
      viralPotential: 'high',
      description: 'Generate child appearance from two parent faces',
      prompt: '生成图中两人物所生孩子的样子，专业摄影',
      difficulty: 'medium',
      requirements: ['Two parent face images'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961450858643952131'
    },
    {
      id: 24,
      name: 'Product Design to Realistic Rendering',
      category: 'design',
      viralPotential: 'medium',
      description: 'Convert design sketches to photorealistic products',
      prompt: 'turn this illustration of a perfume into a realistic version, Frosted glass bottle with a marble cap',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961461774693388346'
    },
    {
      id: 25,
      name: 'Amateur to Professional Photography',
      category: 'photography',
      viralPotential: 'high',
      description: 'Transform amateur photos into professional magazine quality',
      prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin, standing confidently against a bold green gradient background. Dramatic, cinematic lighting highlights her facial structure, evoking the look of a luxury fashion magazine cover. Editorial photography style, high-detail, 4K resolution, symmetrical composition, minimalistic background',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961675915429384629'
    },
    {
      id: 26,
      name: 'Lighting Reference Transfer',
      category: 'photography',
      viralPotential: 'low',
      description: 'Apply specific lighting from reference image',
      prompt: '图一换成图二打光，专业摄影',
      difficulty: 'medium',
      requirements: ['Subject image', 'Lighting reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961754299769426078'
    },
    {
      id: 27,
      name: 'Light Mannequin Reference',
      category: 'photography',
      viralPotential: 'low',
      description: 'Use light mannequin for professional lighting reference',
      prompt: '图一人物变成图二光影，深色为暗',
      difficulty: 'medium',
      requirements: ['Subject image', 'Light mannequin reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961779457372602725'
    },
    {
      id: 28,
      name: 'Painting/Rendering Process Grid',
      category: 'transformation',
      viralPotential: 'medium',
      description: 'Show step-by-step artistic process in grid format',
      prompt: '把图一变成图二那样的四宫格，从草图逐渐到上色渲染',
      difficulty: 'medium',
      requirements: ['Subject image', 'Grid reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961766001160372454'
    },
    {
      id: 29,
      name: 'Photo to Illustration with Process',
      category: 'transformation',
      viralPotential: 'medium',
      description: 'Convert photo to illustration showing painting steps',
      prompt: '为人物生成绘画过程四宫格，第一步：线稿，第二步平铺颜色，第三步：增加阴影，第四步：细化成型。不要文字',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961772524611768452'
    },
    {
      id: 30,
      name: 'Face Shape Reference for Cartoon',
      category: 'character',
      viralPotential: 'medium',
      description: 'Use face shape reference to create cartoon version',
      prompt: '图一人物按照图二的脸型设计为q版形象',
      difficulty: 'medium',
      requirements: ['Character image', 'Face shape reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1961802767493939632'
    },
    {
      id: 31,
      name: 'Universal Style to Realism',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Convert any artistic style to photorealistic version',
      prompt: 'turn this illustration into realistic version',
      difficulty: 'simple',
      examples: ['Works on anime', 'Works on cartoons', 'Works on paintings', 'Works on sketches'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962481046827725249'
    },
    {
      id: 32,
      name: 'Curved Screen Mapping',
      category: 'design',
      viralPotential: 'medium',
      description: 'Map images onto curved screens naturally',
      prompt: '把图一放在图二大屏幕上，撑满整个屏幕',
      difficulty: 'medium',
      requirements: ['Content image', 'Screen reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962489533980873108'
    },
    {
      id: 33,
      name: 'Naked Eye 3D Content for Screens',
      category: 'design',
      viralPotential: 'high',
      description: 'Generate 3D content specifically for curved displays',
      prompt: '为大屏幕上换上裸眼 3D 猫猫',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962518539161706564'
    },
    {
      id: 34,
      name: 'Photo to Keychain/Accessory on Bags',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform photos into keychains attached to bags',
      prompt: '把这张照片变成一个可爱挂件/亚克力材质的扁平钥匙扣/橡胶材质的扁平钥匙扣 挂在 lv 包包/图二照片的包包上',
      difficulty: 'medium',
      requirements: ['Photo to transform', 'Bag reference (optional)'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962514702925488497'
    },
    {
      id: 35,
      name: 'Material/Texture Overlay',
      category: 'enhancement',
      viralPotential: 'medium',
      description: 'Apply specific materials or textures to photos',
      prompt: '为图一照片叠加上图二玻璃的效果',
      difficulty: 'medium',
      requirements: ['Subject photo', 'Material reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962520937011855793'
    },
    {
      id: 36,
      name: 'Photo to Cute Doll',
      category: 'transformation',
      viralPotential: 'high',
      description: 'Transform photo into cute doll version',
      prompt: '把这张照片变成一个可爱玩偶',
      difficulty: 'simple',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962536210762723701'
    },
    {
      id: 37,
      name: 'Product Packaging Integration',
      category: 'design',
      viralPotential: 'medium',
      description: 'Integrate designs onto product packaging',
      prompt: '把图一贴在图二易拉罐上，并放在极简设计的布景中，专业摄影',
      difficulty: 'medium',
      requirements: ['Design/logo', 'Product reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962763864875167971'
    },
    {
      id: 38,
      name: 'Large Surface Image Placement',
      category: 'design',
      viralPotential: 'medium',
      description: 'Place images on large surfaces like stairs',
      prompt: '把图一海报贴在图二的大阶梯上',
      difficulty: 'medium',
      requirements: ['Poster/image', 'Large surface reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962770899817697391'
    },
    {
      id: 39,
      name: 'Virtual Makeup Try-On',
      category: 'enhancement',
      viralPotential: 'high',
      description: 'Apply specific makeup while preserving pose',
      prompt: '为图一人物化上图二的妆，还保持图一的姿势',
      difficulty: 'medium',
      requirements: ['Person photo', 'Makeup reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962778069242126824'
    },
    {
      id: 40,
      name: 'Makeup Analysis + Optimization',
      category: 'enhancement',
      viralPotential: 'medium',
      description: 'Analyze makeup and provide improvement suggestions',
      prompt: 'Analyze this image. Use red pen to denote where you can improve',
      difficulty: 'simple',
      originalSource: 'https://x.com/AiMachete/status/1962356993550643355'
    },
    {
      id: 41,
      name: 'Industrial Design Hand-drawn to Reality',
      category: 'design',
      viralPotential: 'medium',
      description: 'Convert hand-drawn industrial designs to realistic versions',
      prompt: 'turn this photo into realistic version, with light brown leather, put into a Minimalism museum',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962846468294979839'
    },
    {
      id: 42,
      name: 'Industrial Design套图 (Marker/Watercolor/Analysis)',
      category: 'design',
      viralPotential: 'medium',
      description: 'Generate complete design套图 with different artistic styles',
      prompt: 'turn this photo into 马克笔画/水彩画/diagram',
      difficulty: 'medium',
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1962873976528699495'
    },
    {
      id: 43,
      name: 'Expression Accurate Reference (Anime/Real)',
      category: 'character',
      viralPotential: 'medium',
      description: 'Transfer expressions between anime and real people accurately',
      prompt: '图一人物参考/换成图二人物的表情',
      difficulty: 'medium',
      requirements: ['Subject image', 'Expression reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1963156830458085674'
    },
    {
      id: 44,
      name: 'Animal Humanoid Expression',
      category: 'character',
      viralPotential: 'high',
      description: 'Apply human expressions to animals',
      prompt: '把图二猫咪变成图一人物那样的表情',
      difficulty: 'medium',
      requirements: ['Human expression reference', 'Animal photo'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1963160505830510865'
    },
    {
      id: 45,
      name: 'Beautiful Card Design',
      category: 'design',
      viralPotential: 'medium',
      description: 'Create professional card designs with character integration',
      prompt: '按照我的图一名片设计稿的构图和质感，为我的图二人物生成卡片\n\n卡片右上角为可爱卡通形象，突出于卡片\n\nname: Nani\nOccupation：artist\nCompany：zano-banana\nTelephone：82732691',
      difficulty: 'medium',
      requirements: ['Card design reference', 'Character image'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1963195443153616902'
    },
    {
      id: 46,
      name: 'Multi-Character Illustration Collection',
      category: 'character',
      viralPotential: 'high',
      description: 'Convert multiple characters into unified artistic style',
      prompt: '把前四个人物都变成图五那样的 黑白 极简风插画，人物要可爱并保持各自特点，并为每个人物配上合适的小道具，线条要优美，头发部分像图五那样为黑色块，并在一张图里',
      difficulty: 'complex',
      requirements: ['Multiple character images', 'Style reference'],
      originalSource: 'https://x.com/ZHO_ZHO_ZHO/status/1963499861908836507'
    }
  ];

  /**
   * Get technique by ID
   */
  getTechnique(id: number): ZHOTechnique | undefined {
    return this.techniques.find(tech => tech.id === id);
  }

  /**
   * Get techniques by category
   */
  getTechniquesByCategory(category: ZHOTechnique['category']): ZHOTechnique[] {
    return this.techniques.filter(tech => tech.category === category);
  }

  /**
   * Get viral techniques (high potential only)
   */
  getViralTechniques(): ZHOTechnique[] {
    return this.techniques.filter(tech => tech.viralPotential === 'high');
  }

  /**
   * Get simple techniques (easy to use)
   */
  getSimpleTechniques(): ZHOTechnique[] {
    return this.techniques.filter(tech => tech.difficulty === 'simple');
  }

  /**
   * Search techniques by name or description
   */
  searchTechniques(query: string): ZHOTechnique[] {
    const lowerQuery = query.toLowerCase();
    return this.techniques.filter(tech =>
      tech.name.toLowerCase().includes(lowerQuery) ||
      tech.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all techniques
   */
  getAllTechniques(): ZHOTechnique[] {
    return [...this.techniques];
  }

  // Removed duplicate - using the implementation at line 633

  /**
   * Get recommended techniques for specific use cases
   */
  getRecommendedFor(useCase: 'viral' | 'branding' | 'photography' | 'character' | 'simple'): ZHOTechnique[] {
    switch (useCase) {
      case 'viral':
        return this.getViralTechniques();
      case 'branding':
        return this.getTechniquesByCategory('design');
      case 'photography':
        return this.getTechniquesByCategory('photography');
      case 'character':
        return this.getTechniquesByCategory('character');
      case 'simple':
        return this.getSimpleTechniques();
      default:
        return this.techniques.slice(0, 10); // Top 10
    }
  }

  /**
   * Get technique statistics
   */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byViralPotential: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    const byViralPotential: Record<string, number> = {};

    this.techniques.forEach(tech => {
      byCategory[tech.category] = (byCategory[tech.category] || 0) + 1;
      byDifficulty[tech.difficulty] = (byDifficulty[tech.difficulty] || 0) + 1;
      byViralPotential[tech.viralPotential] = (byViralPotential[tech.viralPotential] || 0) + 1;
    });

    return {
      total: this.techniques.length,
      byCategory,
      byDifficulty,
      byViralPotential
    };
  }

  /**
   * Get specific technique by ID
   */
  getTechniqueById(id: number): ZHOTechnique | undefined {
    return this.techniques.find(tech => tech.id === id);
  }

  /**
   * Apply technique with character preservation
   */
  applyTechniqueWithCharacterPreservation(
    techniqueId: number,
    basePrompt: string,
    preservationElements: string[]
  ): string {
    const technique = this.getTechniqueById(techniqueId);
    if (!technique) {
      throw new Error(`ZHO technique #${techniqueId} not found`);
    }

    const preservationPrompt = `PRESERVE: ${preservationElements.join(', ')}
${technique.prompt}
Base context: ${basePrompt}`;

    return preservationPrompt;
  }
}

// Export singleton instance
export const zhoTechniquesEngine = new ZHOTechniquesEngine();