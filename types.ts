
export type Page = 'dashboard' | 'studio' | 'scheduler' | 'analytics' | 'inbox' | 'ops' | 'trends' | 'strategy' | 'brand-guard' | 'scout' | 'research' | 'settings' | 'vault' | 'competitors' | 'partners' | 'personas' | 'multiplier' | 'globalize' | 'flows' | 'boardroom' | 'fusion' | 'nexus' | 'dna' | 'capsule' | 'dojo' | 'circle' | 'launchpad' | 'blueprint' | 'adrenaline' | 'pitch' | 'quantum' | 'mirror' | 'horizon' | 'deep' | 'prism' | 'oracle' | 'construct' | 'stylist' | 'curator' | 'showrunner' | 'academy' | 'storyboard' | 'scribe' | 'codex' | 'hive' | 'alchemist' | 'negotiator' | 'catalyst' | 'cartographer' | 'mosaic' | 'kaleidoscope' | 'resonator' | 'verdict' | 'loom' | 'biome' | 'frequency' | 'director' | 'syndicate' | 'signal' | 'echo' | 'terminal' | 'sentinel' | 'archive' | 'war-room' | 'sigma' | 'alpha' | 'delta' | 'gamma';

export interface RehearsalScript {
    title: string;
    lines: { speaker: string; text: string }[];
}

/* Fix: Complete the GeneratorTone enum with missing members like PROFESSIONAL */
export enum GeneratorTone {
    PROFESSIONAL = 'Professional',
    CASUAL = 'Casual',
    WITTY = 'Witty',
    PERSUASIVE = 'Persuasive',
    INSPIRATIONAL = 'Inspirational',
    BOLD = 'Bold',
    EDUCATIONAL = 'Educational'
}

/* Fix: Export missing MetricCardProps interface used in Dashboard */
export interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: string;
}

/* Fix: Export missing SystemNotification interface used in Header */
export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
}

/* Fix: Export missing ApprovalItem interface used in ProtocolDelta and geminiService */
export interface ApprovalItem {
    id: string;
    timestamp: string;
    type: string;
    content: string;
    headline?: string;
    aiConfidence: number;
    rationale: string;
    channel: string;
}

/* Fix: Export missing DailyBriefing interface used in Dashboard and geminiService */
export interface DailyBriefing {
    greeting: string;
    strategicPulse: string;
    weatherReport: string;
    actionItems: {
        task: string;
        page: Page;
        urgency: 'high' | 'medium' | 'low';
        context: string;
    }[];
}

/* Fix: Export missing VoiceFingerprint interface used in Scribe, ContentStudio and geminiService */
export interface VoiceFingerprint {
    archetype: string;
    traits: string[];
    metrics: Record<string, number>;
}

/* Fix: Export missing ImageAnalysisResult interface used in geminiService */
export interface ImageAnalysisResult {
    aestheticScore: number;
    bestPlatform: string;
    critique: string;
    caption: string;
    hashtags: string[];
}

/* Fix: Export missing VideoAnalysisResult interface used in geminiService */
export interface VideoAnalysisResult {
    viralityScore: number;
    summary: string;
    hookAnalysis: string;
    pacing: string;
    generatedTweets: string[];
    suggestedCaption: string;
}

/* Fix: Export missing CalendarPost interface used in Scheduler and geminiService */
export interface CalendarPost {
    id: string;
    day: string;
    time: string;
    platform: string;
    postType: string;
    content: string;
}

/* Fix: Export missing AnalyticsReport interface used in Analytics and geminiService */
export interface AnalyticsReport {
    summary: string;
    trends: {
        title: string;
        description: string;
        impact: 'positive' | 'negative' | 'neutral';
    }[];
    recommendations: string[];
}

/* Fix: Export missing MessageAnalysis interface used in SmartInbox and geminiService */
export interface MessageAnalysis {
    sentiment: 'positive' | 'negative' | 'neutral';
    priority: 'high' | 'medium' | 'low';
    category: string;
    summary: string;
}

/* Fix: Export missing InvoiceDetails interface used in BusinessOps and geminiService */
export interface InvoiceDetails {
    id?: string;
    client: string;
    amount: string;
    date: string;
    status: 'pending' | 'overdue' | 'paid';
    description: string;
}

/* Fix: Export missing LegalRisk interface used in BusinessOps and geminiService */
export interface LegalRisk {
    score: number;
    riskLevel: 'High' | 'Medium' | 'Low';
    summary: string;
    flaggedClauses: {
        issue: string;
        original: string;
        suggestion: string;
    }[];
}

/* Fix: Export missing SearchResult interface used in TrendDiscovery and geminiService */
export interface SearchResult {
    summary: string;
    sources: {
        title: string;
        uri: string;
    }[];
}

/* Fix: Export missing SimulationResult interface used in BrandGuard and geminiService */
export interface SimulationResult {
    controversyScore: number;
    riskLevel: 'Safe' | 'Moderate' | 'High';
    analysis: string;
    predictedComments: {
        persona: string;
        handle: string;
        comment: string;
        likes: string;
        sentiment: 'positive' | 'negative' | 'neutral';
    }[];
}

/* Fix: Export missing CrisisResponse interface used in BrandGuard and geminiService */
export interface CrisisResponse {
    strategy: string;
    tone: string;
    content: string;
}

/* Fix: Export missing ScoutResult interface used in LocationScout and geminiService */
export interface ScoutResult {
    analysis: string;
    locations: {
        name: string;
        address: string;
        googleMapsUri: string;
    }[];
}

/* Fix: Export missing Asset interface used in AssetVault, Director and geminiService */
export interface Asset {
    id: string;
    data: string;
    mimeType: string;
    name: string;
    tags: string[];
    aiDescription: string;
    dateAdded: number;
}

/* Fix: Export missing CompetitorAnalysis interface used in CompetitorWatch and geminiService */
export interface CompetitorAnalysis {
    name: string;
    summary: string;
    scores: {
        innovation: number;
        visuals: number;
        voice: number;
        engagement: number;
        frequency: number;
    };
    recentMoves: string[];
    strategicGap: string;
    counterMove: string;
    lastUpdated: string;
}

/* Fix: Export missing InfluencerProfile interface used in PartnerNetwork and geminiService */
export interface InfluencerProfile {
    id: string;
    name: string;
    handle: string;
    platform: string;
    followerCount: string;
    niche: string;
    status: 'Discovered' | 'Contacted' | 'Negotiating' | 'Signed';
    avatarUrl: string;
    matchScore?: number;
    matchAnalysis?: string;
}

/* Fix: Export missing Persona interface used in PersonaLab and geminiService */
export interface Persona {
    id: string;
    name: string;
    age: string;
    occupation: string;
    bio: string;
    goals: string[];
    painPoints: string[];
    platforms: string[];
    avatarUrl: string;
}

/* Fix: Export missing MultiplierResult interface used in Multiplier and geminiService */
export interface MultiplierResult {
    twitterThread?: string[];
    linkedinPost?: string;
    instagramCaption?: string;
    tiktokScript?: string;
    newsletter?: string;
}

/* Fix: Export missing LocalizationResult interface used in Globalize and geminiService */
export interface LocalizationResult {
    region: string;
    language: string;
    content: string;
    culturalNotes: string;
    hashtags: string[];
}

/* Fix: Export missing AgentFlow interface used in NeuralFlows and geminiService */
export interface AgentFlow {
    trigger: string;
    steps: string[];
}

/* Fix: Export missing BoardroomTurn interface used in Boardroom and geminiService */
export interface BoardroomTurn {
    speaker: string;
    text: string;
}

/* Fix: Export missing FusionElement interface used in FusionReactor and geminiService */
export interface FusionElement {
    id: string;
    type: 'trend' | 'persona' | 'format' | 'modifier';
    label: string;
    icon: string;
    color: string;
}

/* Fix: Export missing FusionResult interface used in FusionReactor and geminiService */
export interface FusionResult {
    title: string;
    content: string;
    rationale: string;
}

/* Fix: Export missing NexusNode, NexusEdge and NexusGraph used in TheNexus and geminiService */
export interface NexusNode {
    id: string;
    label: string;
    type: 'brand' | 'competitor' | 'partner' | 'persona';
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    val?: number;
}

export interface NexusEdge {
    source: string;
    target: string;
    relationship: string;
    type: 'positive' | 'negative' | 'neutral';
    description: string;
}

export interface NexusGraph {
    nodes: NexusNode[];
    edges: NexusEdge[];
}

/* Fix: Export missing ViralStructure and MutatedPost interfaces used in ViralDNA and geminiService */
export interface ViralStructure {
    hookType: string;
    emotionalTrigger: string;
    tone: string;
    structure: string[];
}

export interface MutatedPost {
    title: string;
    content: string;
    explanation: string;
}

/* Fix: Export missing PastPost and RemasterResult interfaces used in TimeCapsule and geminiService */
export interface PastPost {
    id: string;
    date: string;
    platform: string;
    metrics: string;
    eraContext: string;
    content: string;
}

export interface RemasterResult {
    modernContent: string;
    strategy: string;
    changes: string[];
}

/* Fix: Export missing DojoScenario and DojoFeedback interfaces used in TheDojo and geminiService */
export interface DojoScenario {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    aiPersona: string;
    description: string;
    initialMessage: string;
}

export interface DojoFeedback {
    score: number;
    critique: string;
    tip: string;
}

/* Fix: Export missing FanProfile interface used in InnerCircle and geminiService */
export interface FanProfile {
    id: string;
    name: string;
    handle: string;
    loyaltyScore: number;
    joinDate: string;
    interactions: number;
    tags: string[];
    avatarUrl: string;
    aiMemory?: string;
}

/* Fix: Export missing LaunchDay and LaunchSequence interfaces used in Launchpad and geminiService */
export interface LaunchDay {
    day: number;
    phase: string;
    title: string;
    channel: string;
    strategy: string;
    content: string;
}

export interface LaunchSequence {
    productName: string;
    days: LaunchDay[];
}

/* Fix: Export missing FunnelAssets interface used in TheBlueprint and geminiService */
export interface FunnelAssets {
    leadMagnet: {
        title: string;
        format: string;
        description: string;
    };
    landingPage: {
        headline: string;
        subheadline: string;
        bullets: string[];
        cta: string;
    };
    emails: {
        subject: string;
        bodyOutline: string;
    }[];
}

/* Fix: Export missing AdVariant and AdCampaign interfaces used in Adrenaline and geminiService */
export interface AdVariant {
    id: string;
    angle: string;
    headline: string;
    hook: string;
    body: string;
    visualDescription: string;
    predictedCTR: number;
}

export interface AdCampaign {
    product: string;
    variants: AdVariant[];
}

/* Fix: Export missing PitchSlide and PitchDeck interfaces used in ThePitch and geminiService */
export interface PitchSlide {
    title: string;
    bullets: string[];
    visualCue: string;
    speakerNotes: string;
}

export interface PitchDeck {
    slides: PitchSlide[];
}

/* Fix: Export missing QuantumPost and QuantumTimeline interfaces used in QuantumFeed and geminiService */
export interface QuantumPost {
    id: string;
    format: string;
    headline: string;
    hook: string;
    content: string;
    prediction: string;
}

export interface QuantumTimeline {
    name: string;
    archetype: string;
    color: string;
    posts: QuantumPost[];
}

/* Fix: Export missing MirrorAnalysis interface used in TheMirror and geminiService */
export interface MirrorAnalysis {
    integrityScore: number;
    driftDetected: boolean;
    driftDescription: string;
    correction: string;
    scores: {
        professionalism: number;
        energy: number;
        empathy: number;
        innovation: number;
    };
}

/* Fix: Export missing StoryBeat and NarrativeArc interfaces used in TheHorizon and geminiService */
export interface StoryBeat {
    phase: string;
    title: string;
    objective: string;
    emotion: string;
    contentIdea: string;
}

export interface NarrativeArc {
    title: string;
    summary: string;
    beats: StoryBeat[];
}

/* Fix: Export missing PrismAngle interface used in ThePrism and geminiService */
export interface PrismAngle {
    name: string;
    headline: string;
    content: string;
    trigger: string;
    icon: string;
    color: string;
}

/* Fix: Export missing OracleResult interface used in TheOracle and geminiService */
export interface OracleResult {
    successProbability: number;
    biggestRisk: string;
    biggestOpportunity: string;
    scenarios: {
        name: string;
        probability: number;
        description: string;
        impact: string;
        color: string;
    }[];
}

/* Fix: Export missing StyleIdentity interface used in TheStylist and geminiService */
export interface StyleIdentity {
    name: string;
    vibeDescription: string;
    modifiers: string[];
    cssTheme: {
        backgroundColor: string;
        surfaceColor: string;
        textColor: string;
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamilyHeadings: string;
        fontFamilyBody: string;
    };
}

/* Fix: Export missing Newsletter interface used in TheCurator and geminiService */
export interface Newsletter {
    subject: string;
    intro: string;
    items: {
        title: string;
        source: string;
        summary: string;
        url: string;
    }[];
    outro: string;
}

/* Fix: Export missing ShowEpisode, ShowSeason and EpisodeBrief interfaces used in TheShowrunner and geminiService */
export interface ShowEpisode {
    episodeNumber: number;
    title: string;
    summary: string;
    hook: string;
    guestIdea: string;
}

export interface ShowSeason {
    title: string;
    theme: string;
    episodes: ShowEpisode[];
}

export interface EpisodeBrief {
    title: string;
    segments: {
        segmentName: string;
        time: string;
        content: string;
        notes: string;
    }[];
}

/* Fix: Export missing CourseLesson, CourseModule and AcademyCourse interfaces used in TheAcademy and geminiService */
export interface CourseLesson {
    title: string;
    duration: string;
}

export interface CourseModule {
    title: string;
    lessons: CourseLesson[];
}

export interface AcademyCourse {
    title: string;
    targetAudience: string;
    description: string;
    modules: CourseModule[];
}

/* Fix: Export missing StoryFrame and StoryboardSequence interfaces used in TheStoryboard and geminiService */
export interface StoryFrame {
    frameNumber: number;
    visualPrompt: string;
    overlayText: string;
    voiceover: string;
    estimatedDuration: string;
    generatedImageUrl?: string;
}

export interface StoryboardSequence {
    frames: StoryFrame[];
}

/* Fix: Export missing CodexEntry and FactCheckResult interfaces used in TheCodex and geminiService */
export interface CodexEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    dateAdded: string;
}

export interface FactCheckResult {
    isAccurate: boolean;
    issues: {
        statement: string;
        correction: string;
        source: string;
    }[];
}

/* Fix: Export missing HiveSession interface used in TheHive and geminiService */
export interface HiveSession {
    agents: {
        name: string;
        role: string;
        color: string;
    }[];
    messages: {
        agentName: string;
        text: string;
        type: string;
        timestamp: string;
    }[];
    masterPlan: string;
}

/* Fix: Export missing TransmutationResult interface used in TheAlchemist and geminiService */
export interface TransmutationResult {
    transmuted: string;
    changes: string[];
}

/* Fix: Export missing NegotiationPlan interface used in TheNegotiator and geminiService */
export interface NegotiationPlan {
    strategy: string;
    summary: string;
    tactics: {
        stepName: string;
        script: string;
        rationale: string;
    }[];
    closingLine: string;
}

/* Fix: Export missing GrowthExperiment interface used in TheCatalyst and geminiService */
export interface GrowthExperiment {
    id: string;
    title: string;
    hypothesis: string;
    method: string[];
    metrics: string[];
    iceScore: {
        impact: number;
        confidence: number;
        ease: number;
        total: number;
    };
}

/* Fix: Export missing JourneyStage and JourneyMap interfaces used in TheCartographer and geminiService */
export interface JourneyStage {
    stageName: string;
    userMindset: string;
    frictionPoints: string;
    opportunity: string;
    touchpoints: string[];
    contentIdea: string;
}

export interface JourneyMap {
    stages: JourneyStage[];
}

/* Fix: Export missing UGCItem interface used in TheMosaic and geminiService */
export interface UGCItem {
    id: string;
    userHandle: string;
    platform: string;
    likes: number;
    caption: string;
    brandFitScore: number;
    brandFitReason: string;
    imageUrl: string;
    rightsStatus: 'New' | 'Requested' | 'Approved';
}

/* Fix: Export missing KaleidoscopeRemix interface used in TheKaleidoscope and geminiService */
export interface KaleidoscopeRemix {
    vibe: string;
    format: string;
    copy: string;
    visualPrompt: string;
    generatedImageUrl?: string;
}

/* Fix: Export missing ResonatorAnalysis interface used in TheResonator and geminiService */
export interface ResonatorAnalysis {
    sentiment: string;
    themes: string[];
    topQuestions: string[];
    goldenQuotes: string[];
    vocWords: string[];
    contentOpportunities: {
        title: string;
        premise: string;
    }[];
}

/* Fix: Export missing VerdictResult interface used in TheVerdict and geminiService */
export interface VerdictResult {
    winner: string;
    confidence: number;
    scores: {
        a_clarity: number;
        a_persuasion: number;
        a_hook: number;
        b_clarity: number;
        b_persuasion: number;
        b_hook: number;
    };
    reasoning: string;
    tips: string[];
}

/* Fix: Export missing LoomResult interface used in TheLoom and geminiService */
export interface LoomResult {
    strategyReasoning: string;
    postCopy: string;
    hashtags: string[];
    visualPrompt: string;
    generatedImageUrl?: string;
}

/* Fix: Export missing BiomePlant and BiomeState interfaces used in TheBiome and geminiService */
export interface BiomePlant {
    id: string;
    title: string;
    type: 'tree' | 'flower' | 'shrub' | 'wilted' | 'sprout';
    metrics: string;
    analysis: string;
}

export interface BiomeState {
    healthScore: number;
    weather: string;
    weatherDescription: string;
    plants: BiomePlant[];
    recommendations: string[];
}

/* Fix: Export missing AudioTrack and AudioProject interfaces used in TheFrequency and geminiService */
export interface AudioTrack {
    id: string;
    name: string;
    type: 'voice' | 'music' | 'sfx';
    volume: number;
    duration: string;
}

export interface AudioProject {
    title: string;
    bpm: number;
    tracks: AudioTrack[];
    aiSuggestions: string[];
}

/* Fix: Export missing VideoClip and DirectorTimeline interfaces used in TheDirector and geminiService */
export interface VideoClip {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    type: 'video' | 'audio';
    track: number;
    color: string;
}

export interface DirectorTimeline {
    duration: number;
    clips: VideoClip[];
}

/* Fix: Export missing TaskCard and SyndicateBoard interfaces used in TheSyndicate and geminiService */
export interface TaskCard {
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    assigneeId: string;
    tags: string[];
    output?: string;
    outputType?: 'text' | 'image';
}

export interface SyndicateBoard {
    columns: {
        id: string;
        title: string;
        cards: TaskCard[];
    }[];
    members: {
        id: string;
        name: string;
        role: string;
        avatar: string;
        isAi: boolean;
        status: 'online' | 'busy' | 'offline';
    }[];
}

/* Fix: Export missing StreamMessage and StreamInsight interfaces used in TheSignal, TheWarRoom and geminiService */
export interface StreamMessage {
    id: string;
    user: string;
    text: string;
    timestamp: string;
}

export interface StreamInsight {
    sentiment: string;
    trendingTopic: string;
    suggestedTalkingPoint: string;
    topQuestions: string[];
}

/* Fix: Export missing EchoResult interface used in TheEcho and geminiService */
export interface EchoResult {
    transcript: string;
    summary: string;
    tweets: string[];
    linkedInPost: string;
    actionItems: string[];
}

/* Fix: Export missing TerminalMessage interface used in TheTerminal and geminiService */
export interface TerminalMessage {
    type: 'system' | 'input' | 'output' | 'error';
    content: string;
    timestamp: string;
}

/* Fix: Export missing SentinelHit interface used in TheSentinel, TheWarRoom and geminiService */
export interface SentinelHit {
    id: string;
    timestamp: string;
    type: string;
    title: string;
    description: string;
    urgency: 'Critical' | 'High' | 'Normal';
    context: string;
    location: {
        x: number;
        y: number;
    };
}

/* Fix: Export missing SigmaNiche interface used in ProtocolSigma, ProtocolAlpha and geminiService */
export interface SigmaNiche {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    whyNow: string;
    strategicGap: string;
    growthScore: number;
    resonanceScore: number;
}

/* Fix: Export missing AlphaCampaign interface used in ProtocolAlpha and geminiService */
export interface AlphaCampaign {
    strategy: string;
    tasks: string[];
    channels: {
        twitter: { thread: string[] };
        linkedin: { post: string, keyInsights: string[] };
        video: { hook: string, storyboardPrompt: string, vibe: string };
        ads: { headline: string, body: string, visualConcept: string };
    };
}

/* Fix: Export missing NeuralEvent interface used in TheArchive, TheWarRoom and geminiService */
export interface NeuralEvent {
    id: string;
    timestamp: string;
    type: 'Generation' | 'Analysis' | 'Decision' | 'System';
    module: string;
    summary: string;
    content: string;
}
