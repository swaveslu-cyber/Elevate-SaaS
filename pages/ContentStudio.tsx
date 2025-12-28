import React, { useState, useEffect, useRef } from 'react';
import { generateSocialPost, refineContent, generateSocialImage, editSocialImage, generateSocialVideo, generateVoiceover, analyzeImageContent, generatePodcastScript, generatePodcastAudio, analyzeVideoContent } from '../services/geminiService';
import { GeneratorTone, ImageAnalysisResult, VideoAnalysisResult, VoiceFingerprint } from '../types';

type GeneratorTab = 'text' | 'image' | 'video' | 'audio' | 'analyze';

interface ContentStudioProps {
  initialTopic?: string;
}

const VOICES = [
  { name: 'Puck', label: 'Puck (Neutral)' },
  { name: 'Charon', label: 'Charon (Deep)' },
  { name: 'Kore', label: 'Kore (Calm)' },
  { name: 'Fenrir', label: 'Fenrir (Intense)' },
  { name: 'Zephyr', label: 'Zephyr (Gentle)' }
];

const ASPECT_RATIOS = [
    { label: 'Square (1:1)', value: '1:1', icon: 'fa-square' },
    { label: 'Portrait (9:16)', value: '9:16', icon: 'fa-mobile-screen' },
    { label: 'Landscape (16:9)', value: '16:9', icon: 'fa-image' },
];

const EmptyState: React.FC<{ icon: string; message: string }> = ({ icon, message }) => (
  <div className="h-full flex flex-col items-center justify-center text-muted opacity-50 p-8 text-center">
    <i className={`fa-solid ${icon} text-4xl mb-4`}></i>
    <p>{message}</p>
  </div>
);

const UserHeader: React.FC<{ platform: string }> = ({ platform }) => (
  <div className="flex items-center gap-3 mb-4">
    <img 
      src="https://picsum.photos/40/40" 
      alt="User" 
      className="w-10 h-10 rounded-full border border-slate-700"
    />
    <div>
      <h4 className="font-bold text-sm text-white">Alex Creator</h4>
      <p className="text-xs text-muted flex items-center gap-1">
        <span className="capitalize">{platform}</span> • Just now
      </p>
    </div>
    <div className="ml-auto text-muted">
       <i className="fa-solid fa-ellipsis"></i>
    </div>
  </div>
);

const SocialActions: React.FC = () => (
  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700 text-muted">
    <button className="flex items-center gap-2 hover:text-red-400 transition-colors text-xs">
      <i className="fa-regular fa-heart"></i> Like
    </button>
    <button className="flex items-center gap-2 hover:text-blue-400 transition-colors text-xs">
      <i className="fa-regular fa-comment"></i> Comment
    </button>
    <button className="flex items-center gap-2 hover:text-green-400 transition-colors text-xs">
      <i className="fa-solid fa-retweet"></i> Repost
    </button>
    <button className="flex items-center gap-2 hover:text-white transition-colors text-xs">
      <i className="fa-solid fa-share-nodes"></i> Share
    </button>
  </div>
);

export const ContentStudio: React.FC<ContentStudioProps> = ({ initialTopic }) => {
  const [activeTab, setActiveTab] = useState<GeneratorTab>('text');
  
  // Common State
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const [hasPaidKey, setHasPaidKey] = useState(false);
  
  // Text State
  const [tone, setTone] = useState<GeneratorTone>(GeneratorTone.PROFESSIONAL);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [neuralVoice, setNeuralVoice] = useState<VoiceFingerprint | null>(null);
  const [useNeuralVoice, setUseNeuralVoice] = useState(false);

  // Image Generation State
  const [imageMode, setImageMode] = useState<'generate' | 'edit'>('generate');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  const [isHighQuality, setIsHighQuality] = useState(false);

  // Image Edit State
  const [editSourceImage, setEditSourceImage] = useState<string | null>(null);
  const [editSourceMime, setEditSourceMime] = useState<string>('image/png');
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');

  // Audio State
  const [audioMode, setAudioMode] = useState<'single' | 'podcast'>('single');
  const [audioScript, setAudioScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [generatedAudioBase64, setGeneratedAudioBase64] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Podcast State
  const [podcastTopic, setPodcastTopic] = useState('');
  const [podcastScript, setPodcastScript] = useState<{speaker: string, text: string}[]>([]);
  const [hostVoice, setHostVoice] = useState('Kore');
  const [guestVoice, setGuestVoice] = useState('Fenrir');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Analysis (Vision + Video) State
  const [analysisMedia, setAnalysisMedia] = useState<string | null>(null); // Preview URL
  const [analysisMediaType, setAnalysisMediaType] = useState<'image' | 'video' | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisFileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialTopic to local state
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setPodcastTopic(initialTopic);
    }
  }, [initialTopic]);

  // Load Neural Voice from Core
  useEffect(() => {
      const storedVoice = localStorage.getItem('elevate_voice_fingerprint');
      if (storedVoice) {
          setNeuralVoice(JSON.parse(storedVoice));
          setUseNeuralVoice(true); // Auto-enable if available
      }
  }, []);

  // Auto-fill prompts when topic changes
  useEffect(() => {
    if (topic) {
      if (!imagePrompt) setImagePrompt(`A high quality, minimal illustration about: ${topic}`);
      if (!videoPrompt) setVideoPrompt(`Cinematic, high-res video about: ${topic}, 4k, realistic lighting`);
      if (!audioScript) setAudioScript(`Here are three things you need to know about ${topic}. Number one...`);
    }
  }, [topic]);

  // Check for key availability (simulated for UI purposes)
  useEffect(() => {
    const checkKey = async () => {
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setHasPaidKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      await win.aistudio.openSelectKey();
      setHasPaidKey(true);
    }
  };

  const handleGenerateText = async () => {
    if (!topic) return;
    setIsGeneratingText(true);
    // Pass the neural voice if toggle is on
    const content = await generateSocialPost(topic, platform, tone, useNeuralVoice ? (neuralVoice || undefined) : undefined);
    setGeneratedContent(content);
    setIsGeneratingText(false);
  };

  const handleRefine = async (instruction: string) => {
    if (!generatedContent) return;
    setIsGeneratingText(true);
    const refined = await refineContent(generatedContent, instruction);
    setGeneratedContent(refined);
    setIsGeneratingText(false);
  };

  const handleGenerateImage = async () => {
    const promptToUse = imagePrompt || topic;
    if (!promptToUse) return;

    if (isHighQuality && !hasPaidKey) {
        await handleSelectKey();
    }

    setIsGeneratingImage(true);
    setGeneratedImage(null);
    try {
        const imageData = await generateSocialImage(promptToUse, {
            aspectRatio: imageAspectRatio,
            highQuality: isHighQuality
        });
        setGeneratedImage(imageData);
    } catch (e) {
        console.error(e);
        if (isHighQuality) setHasPaidKey(false);
    }
    setIsGeneratingImage(false);
  };

  const handleEditImage = async () => {
      if (!editSourceImage || !editPrompt) return;
      setIsEditingImage(true);
      setEditedImage(null);

      // Extract base64
      const base64Data = editSourceImage.split(',')[1];
      const result = await editSocialImage(base64Data, editSourceMime, editPrompt);
      setEditedImage(result);
      setIsEditingImage(false);
  };

  const handleEditUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSourceImage(reader.result as string);
        setEditSourceMime(file.type);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    const promptToUse = videoPrompt || topic;
    if (!promptToUse) return;
    
    if (!hasPaidKey) {
       await handleSelectKey();
    }

    setIsGeneratingVideo(true);
    setGeneratedVideo(null);
    try {
        const videoUri = await generateSocialVideo(promptToUse, { aspectRatio: videoAspectRatio });
        setGeneratedVideo(videoUri);
    } catch (e) {
        console.error(e);
        setHasPaidKey(false);
    }
    setIsGeneratingVideo(false);
  };

  const handleGenerateAudio = async () => {
    const scriptToUse = audioScript || topic;
    if (!scriptToUse) return;

    setIsGeneratingAudio(true);
    setGeneratedAudioBase64(null);
    const audioData = await generateVoiceover(scriptToUse, selectedVoice);
    setGeneratedAudioBase64(audioData);
    setIsGeneratingAudio(false);
  };

  const handleGeneratePodcastScript = async () => {
      if (!podcastTopic) return;
      setIsGeneratingScript(true);
      const script = await generatePodcastScript(podcastTopic);
      setPodcastScript(script);
      setIsGeneratingScript(false);
  };

  const handleGeneratePodcastAudio = async () => {
      if (podcastScript.length === 0) return;
      setIsGeneratingAudio(true);
      setGeneratedAudioBase64(null);
      const audioData = await generatePodcastAudio(podcastScript, hostVoice, guestVoice);
      setGeneratedAudioBase64(audioData);
      setIsGeneratingAudio(false);
  };

  const handleAnalysisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        handleFileSelection(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
        handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) return;

      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        setAnalysisMedia(base64Url);
        setAnalysisMediaType(isVideo ? 'video' : 'image');
        setImageAnalysis(null);
        setVideoAnalysis(null);
        
        setIsAnalyzing(true);
        // Strip header 'data:image/jpeg;base64,' for the API
        const base64Data = base64Url.split(',')[1];
        
        if (isVideo) {
            if (file.size > 20 * 1024 * 1024) {
                alert("For this demo, please use videos under 20MB.");
                setIsAnalyzing(false);
                return;
            }
            const result = await analyzeVideoContent(base64Data, file.type);
            setVideoAnalysis(result);
        } else {
            const result = await analyzeImageContent(base64Data, file.type);
            setImageAnalysis(result);
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
  };

  // Helper to decode Base64
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper to play PCM data using Web Audio API
  const playAudio = async () => {
    if (!generatedAudioBase64) return;
    
    try {
      setIsPlayingAudio(true);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const pcmBytes = decodeBase64(generatedAudioBase64);
      
      // Convert 16-bit PCM to Float32
      const float32Data = new Float32Array(pcmBytes.length / 2);
      const dataView = new DataView(pcmBytes.buffer);
      
      for (let i = 0; i < float32Data.length; i++) {
        // Little endian
        const int16 = dataView.getInt16(i * 2, true); 
        float32Data[i] = int16 / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlayingAudio(false);
        audioContext.close();
      };
      
      source.start();
    } catch (e) {
      console.error("Error playing audio", e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Input Section */}
      <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <i className="fa-solid fa-wand-sparkles text-primary"></i> Generator
            </h2>
            <p className="text-sm text-muted">Create multi-modal content.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900/50 p-1 rounded-lg">
           {(['text', 'image', 'video', 'audio', 'analyze'] as GeneratorTab[]).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-md capitalize transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab 
                    ? 'bg-surface text-white shadow-sm border border-slate-700' 
                    : 'text-muted hover:text-text'
                  }`}
               >
                   <i className={`fa-solid ${
                       tab === 'text' ? 'fa-align-left' : 
                       tab === 'image' ? 'fa-image' : 
                       tab === 'video' ? 'fa-video' : 
                       tab === 'audio' ? 'fa-microphone' : 'fa-magnifying-glass-chart'
                   }`}></i>
                   <span className="hidden sm:inline">{tab === 'analyze' ? 'Analyze' : tab}</span>
               </button>
           ))}
        </div>

        {/* Dynamic Content based on Tab */}
        <div className="space-y-4">
          
          {/* TEXT GENERATION */}
          {activeTab === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Platform</label>
                <div className="flex gap-2">
                  {['Twitter', 'LinkedIn', 'Instagram'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        platform === p 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-transparent border-slate-600 text-muted hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Tone</label>
                <select 
                  value={tone} 
                  onChange={(e) => setTone(e.target.value as GeneratorTone)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {Object.values(GeneratorTone).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Neural Voice Toggle */}
              {neuralVoice && (
                  <div 
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          useNeuralVoice 
                          ? 'bg-emerald-900/20 border-emerald-500/50' 
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                      onClick={() => setUseNeuralVoice(!useNeuralVoice)}
                  >
                      <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              useNeuralVoice ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-muted'
                          }`}>
                              <i className="fa-solid fa-fingerprint"></i>
                          </div>
                          <div>
                              <span className={`block text-sm font-bold ${useNeuralVoice ? 'text-emerald-300' : 'text-slate-400'}`}>
                                  Neural Voice: {neuralVoice.archetype}
                              </span>
                              <span className="text-[10px] text-muted">Use cloning profile from The Scribe</span>
                          </div>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${useNeuralVoice ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                          <div className={`w-3 h-3 rounded-full bg-white transition-transform ${useNeuralVoice ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Topic / Idea</label>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Launching a new AI feature for video editing..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleGenerateText}
                disabled={isGeneratingText || !topic}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                  isGeneratingText ? 'bg-indigo-700 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                }`}
              >
                {isGeneratingText ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Writing...
                  </span>
                ) : 'Generate Text'}
              </button>
            </>
          )}

          {/* IMAGE GENERATION & EDITING */}
          {activeTab === 'image' && (
             <div className="space-y-4">
                <div className="flex p-1 bg-slate-800 rounded-lg mb-2">
                    <button 
                        onClick={() => setImageMode('generate')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === 'generate' ? 'bg-primary text-white shadow' : 'text-muted hover:text-white'}`}
                    >
                        Generate New
                    </button>
                    <button 
                        onClick={() => setImageMode('edit')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === 'edit' ? 'bg-primary text-white shadow' : 'text-muted hover:text-white'}`}
                    >
                        Edit Existing
                    </button>
                </div>

                {imageMode === 'generate' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button
                                        key={ratio.value}
                                        onClick={() => setImageAspectRatio(ratio.value)}
                                        className={`py-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                                            imageAspectRatio === ratio.value 
                                            ? 'bg-primary/20 border-primary text-white' 
                                            : 'bg-transparent border-slate-700 text-muted hover:bg-slate-800'
                                        }`}
                                    >
                                        <i className={`fa-solid ${ratio.icon}`}></i>
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div 
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                                isHighQuality ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'
                            }`}
                            onClick={() => setIsHighQuality(!isHighQuality)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isHighQuality ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-muted'
                                }`}>
                                    <i className="fa-solid fa-crown"></i>
                                </div>
                                <div>
                                    <span className={`block text-sm font-bold ${isHighQuality ? 'text-white' : 'text-slate-300'}`}>Pro Mode</span>
                                    <span className="text-xs text-muted">Use Gemini 3.0 Pro for 2K resolution</span>
                                </div>
                            </div>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isHighQuality ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isHighQuality ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-muted mb-2">Image Prompt</label>
                        <textarea 
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Describe the image..."
                            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
                        />
                        </div>
                        <button 
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !imagePrompt}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 rounded-lg font-bold text-white transition-all shadow-lg"
                        >
                        {isGeneratingImage ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Generating Art...</> : 'Generate Image'}
                        </button>
                    </>
                ) : (
                    // EDIT MODE
                    <>
                        <input 
                            type="file" 
                            ref={editFileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleEditUpload}
                        />
                        <div 
                            onClick={() => editFileInputRef.current?.click()}
                            className={`min-h-[150px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                                editSourceImage 
                                ? 'border-primary/50 bg-primary/10' 
                                : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-slate-500'
                            }`}
                        >
                            {editSourceImage ? (
                                <div className="relative w-full h-full p-2 flex items-center justify-center">
                                    <img src={editSourceImage} alt="Source" className="max-h-[140px] rounded object-contain" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                                        <p className="text-white text-xs font-bold">Change Image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <i className="fa-solid fa-upload text-2xl text-slate-500 mb-2"></i>
                                    <p className="text-xs text-muted">Upload image to edit</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Edit Instructions</label>
                            <textarea 
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="e.g. Add a neon sign, change background to space, make it sketch style..."
                                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
                            />
                        </div>

                        <button 
                            onClick={handleEditImage}
                            disabled={isEditingImage || !editSourceImage || !editPrompt}
                            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 rounded-lg font-bold text-white transition-all shadow-lg"
                        >
                            {isEditingImage ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Editing Image...</> : 'Edit Image'}
                        </button>
                    </>
                )}
             </div>
          )}

          {/* VIDEO GENERATION */}
          {activeTab === 'video' && (
             <div className="space-y-4">
                {!hasPaidKey && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1"></i>
                            <div>
                                <h4 className="text-sm font-bold text-amber-500 mb-1">Veo Requires Paid Access</h4>
                                <p className="text-xs text-muted mb-2">To generate high-quality videos with Veo, you must select a paid project.</p>
                                <button 
                                    onClick={handleSelectKey}
                                    className="text-xs bg-amber-500 text-black px-3 py-1.5 rounded font-bold hover:bg-amber-400"
                                >
                                    Select Project
                                </button>
                                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block mt-2 text-[10px] text-amber-400 underline">
                                    View Billing Docs
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">Aspect Ratio</label>
                    <div className="flex gap-3">
                         <button 
                             onClick={() => setVideoAspectRatio('16:9')}
                             className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                                 videoAspectRatio === '16:9' ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-transparent border-slate-700 text-muted'
                             }`}
                         >
                             <i className="fa-solid fa-tv"></i> Landscape (16:9)
                         </button>
                         <button 
                             onClick={() => setVideoAspectRatio('9:16')}
                             className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                                 videoAspectRatio === '9:16' ? 'bg-pink-500/20 border-pink-500 text-white' : 'bg-transparent border-slate-700 text-muted'
                             }`}
                         >
                             <i className="fa-solid fa-mobile-screen"></i> Portrait (9:16)
                         </button>
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-muted mb-2">Video Prompt</label>
                   <textarea 
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Describe the video scene..."
                      className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
                   />
                </div>
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || !videoPrompt}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 rounded-lg font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isGeneratingVideo ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Creating Video (this may take a minute)...</> : 'Generate Video (Veo)'}
                </button>
             </div>
          )}

          {/* AUDIO GENERATION */}
          {activeTab === 'audio' && (
             <div className="space-y-4">
                 <div className="flex p-1 bg-slate-800 rounded-lg mb-2">
                    <button 
                        onClick={() => setAudioMode('single')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${audioMode === 'single' ? 'bg-cyan-600 text-white shadow' : 'text-muted hover:text-white'}`}
                    >
                        Single Voice
                    </button>
                    <button 
                        onClick={() => setAudioMode('podcast')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${audioMode === 'podcast' ? 'bg-cyan-600 text-white shadow' : 'text-muted hover:text-white'}`}
                    >
                        Dual Speaker Podcast
                    </button>
                </div>

                {audioMode === 'single' ? (
                    <>
                        <div>
                        <label className="block text-sm font-medium text-muted mb-2">Voice Persona</label>
                        <select 
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                        >
                            {VOICES.map(v => (
                                <option key={v.name} value={v.name}>{v.label}</option>
                            ))}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-muted mb-2">Voiceover Script</label>
                        <textarea 
                            value={audioScript}
                            onChange={(e) => setAudioScript(e.target.value)}
                            placeholder="Write the script for the voiceover..."
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none"
                        />
                        </div>
                        <button 
                        onClick={handleGenerateAudio}
                        disabled={isGeneratingAudio || !audioScript}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 rounded-lg font-bold text-white transition-all shadow-lg"
                        >
                        {isGeneratingAudio ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Synthesizing Voice...</> : 'Generate Voiceover'}
                        </button>
                    </>
                ) : (
                    // PODCAST MODE
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted mb-2">Host Voice</label>
                                <select 
                                    value={hostVoice}
                                    onChange={(e) => setHostVoice(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs focus:border-primary outline-none"
                                >
                                    {VOICES.map(v => (
                                        <option key={v.name} value={v.name}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted mb-2">Guest Voice</label>
                                <select 
                                    value={guestVoice}
                                    onChange={(e) => setGuestVoice(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs focus:border-primary outline-none"
                                >
                                    {VOICES.map(v => (
                                        <option key={v.name} value={v.name}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Podcast Topic</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={podcastTopic}
                                    onChange={(e) => setPodcastTopic(e.target.value)}
                                    placeholder="e.g., The Future of Remote Work"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                                />
                                <button 
                                    onClick={handleGeneratePodcastScript}
                                    disabled={isGeneratingScript || !podcastTopic}
                                    className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-colors"
                                >
                                    {isGeneratingScript ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Generate Script'}
                                </button>
                            </div>
                        </div>

                        {podcastScript.length > 0 && (
                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                                {podcastScript.map((turn, i) => (
                                    <div key={i} className={`p-2 rounded text-xs ${turn.speaker === 'Host' ? 'bg-cyan-900/20 ml-4' : 'bg-purple-900/20 mr-4'}`}>
                                        <span className="font-bold opacity-70 block mb-1">{turn.speaker}</span>
                                        {turn.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={handleGeneratePodcastAudio}
                            disabled={isGeneratingAudio || podcastScript.length === 0}
                            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 rounded-lg font-bold text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAudio ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Producing Podcast...</> : 'Synthesize Show'}
                        </button>
                    </>
                )}
             </div>
          )}

          {/* VISION & VIDEO ANALYSIS */}
          {activeTab === 'analyze' && (
             <div className="space-y-4 h-full flex flex-col">
                <input 
                    type="file" 
                    ref={analysisFileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleAnalysisUpload}
                />
                
                <div 
                    onClick={() => analysisFileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                        analysisMedia 
                        ? 'border-indigo-500/50 bg-indigo-500/10' 
                        : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                >
                    {analysisMedia ? (
                        <div className="relative w-full h-full p-4 flex items-center justify-center">
                            {analysisMediaType === 'video' ? (
                                <video src={analysisMedia} controls className="max-h-full max-w-full rounded-lg shadow-lg" />
                            ) : (
                                <img src={analysisMedia} alt="Preview" className="max-h-full max-w-full rounded-lg shadow-lg object-contain" />
                            )}
                            
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-lg m-4">
                                    <div className="text-center">
                                        <i className="fa-solid fa-eye fa-bounce text-4xl text-primary mb-3"></i>
                                        <p className="font-bold">Deconstructing Media...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center p-6">
                            <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-500 mb-4"></i>
                            <h4 className="font-bold text-lg mb-1">Upload Media</h4>
                            <p className="text-sm text-muted">Drop Images or Videos to Analyze & Repurpose</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-center text-muted">Supports Images (PNG, JPG) & Video Clips (MP4). Gemini Vision will break down the content.</p>
             </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="font-semibold text-sm">
             {activeTab === 'analyze' ? 'Intelligence Report' : 'Preview'}
          </h3>
          {activeTab === 'text' && generatedContent && (
             <div className="flex gap-2">
                <button onClick={() => handleRefine("Make it shorter")} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded text-muted hover:text-white border border-slate-600">Shorten</button>
                <button onClick={() => handleRefine("Add emojis")} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded text-muted hover:text-white border border-slate-600">Emojify</button>
             </div>
          )}
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/30">
            {/* Show Text if active tab is text OR if content exists and other tabs are empty */}
            {activeTab === 'text' && !generatedContent && (
                 <EmptyState icon="fa-pen-nib" message="AI text content will appear here." />
            )}

            {activeTab === 'text' && generatedContent && (
                <div className="bg-surface border border-slate-700 rounded-xl p-6 max-w-md mx-auto shadow-xl">
                   <UserHeader platform={platform} />
                   <p className="whitespace-pre-wrap text-sm leading-relaxed mb-4 text-slate-200">{generatedContent}</p>
                   <SocialActions />
                </div>
            )}

            {/* Image Preview (Handles both Generated and Edited) */}
            {activeTab === 'image' && (
                (imageMode === 'generate' && generatedImage) || (imageMode === 'edit' && editedImage) ? (
                    <div className="bg-surface border border-slate-700 rounded-xl p-6 max-w-md mx-auto shadow-xl">
                        <UserHeader platform="Instagram" />
                        <div className="rounded-lg bg-slate-800 w-full overflow-hidden border border-slate-700 mt-3 relative group">
                            <img 
                                src={imageMode === 'generate' ? generatedImage! : editedImage!} 
                                className="w-full h-auto object-cover" 
                                alt="Result" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a 
                                    href={imageMode === 'generate' ? generatedImage! : editedImage!} 
                                    download="elevate_image.png"
                                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold text-xs"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                        <SocialActions />
                    </div>
                ) : (
                    activeTab === 'image' && <EmptyState icon="fa-image" message={imageMode === 'edit' ? "Edited image will appear here." : "AI generated image will appear here."} />
                )
            )}

            {/* Video Preview */}
            {activeTab === 'video' && (
                generatedVideo ? (
                    <div className="bg-surface border border-slate-700 rounded-xl p-6 max-w-md mx-auto shadow-xl">
                        <UserHeader platform={videoAspectRatio === '9:16' ? 'TikTok' : 'YouTube'} />
                        <div className={`rounded-lg bg-black w-full overflow-hidden border border-slate-700 mt-3 relative ${videoAspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                            <video 
                                src={generatedVideo} 
                                controls 
                                autoPlay 
                                loop 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <SocialActions />
                    </div>
                ) : (
                    activeTab === 'video' && <EmptyState icon="fa-video" message="AI generated videos will appear here." />
                )
            )}

             {/* Audio Preview */}
             {activeTab === 'audio' && (
                generatedAudioBase64 ? (
                    <div className="bg-surface border border-slate-700 rounded-xl p-6 max-w-md mx-auto shadow-xl">
                        <UserHeader platform="Podcast" />
                        <div className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 p-8 border border-slate-700 mt-3 flex flex-col items-center justify-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center relative">
                                <i className={`fa-solid ${isPlayingAudio ? 'fa-volume-high animate-pulse' : 'fa-microphone'} text-3xl text-cyan-400`}></i>
                                {isPlayingAudio && <div className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-ping opacity-50"></div>}
                            </div>
                            
                            <div className="text-center mb-2">
                                <h4 className="font-bold text-white text-lg">{audioMode === 'podcast' ? 'AI Podcast' : 'AI Voiceover'}</h4>
                                <p className="text-sm text-cyan-400 font-medium">
                                    {audioMode === 'podcast' ? `${hostVoice} & ${guestVoice}` : selectedVoice}
                                </p>
                            </div>

                            <button 
                                onClick={playAudio}
                                className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
                            >
                                <i className={`fa-solid ${isPlayingAudio ? 'fa-stop' : 'fa-play'}`}></i>
                                {isPlayingAudio ? 'Stop Playing' : 'Play Audio'}
                            </button>
                        </div>
                        <SocialActions />
                    </div>
                ) : (
                    activeTab === 'audio' && <EmptyState icon="fa-microphone-lines" message="AI generated audio will appear here." />
                )
            )}

            {/* Analysis (Vision & Video) Report */}
            {activeTab === 'analyze' && (
                // IMAGE ANALYSIS RENDER
                imageAnalysis ? (
                    <div className="animate-fade-in space-y-6">
                        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 border border-indigo-500/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-indigo-200 font-medium text-sm mb-1">Aesthetic Score</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{imageAnalysis.aestheticScore}</span>
                                    <span className="text-indigo-300">/10</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-400 flex items-center justify-center bg-indigo-950">
                                <i className="fa-solid fa-star text-2xl text-yellow-400"></i>
                            </div>
                        </div>
                        <div className="bg-surface border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                             <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                                 <i className="fa-solid fa-trophy text-amber-400"></i>
                             </div>
                             <div>
                                 <p className="text-xs text-muted">Best Performing Platform</p>
                                 <p className="font-bold text-white">{imageAnalysis.bestPlatform}</p>
                             </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-muted mb-2 uppercase tracking-wide">AI Critique</h4>
                            <p className="text-sm leading-relaxed italic text-slate-200">"{imageAnalysis.critique}"</p>
                        </div>
                        <div className="bg-surface border border-slate-700 rounded-xl p-5">
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-bold text-muted uppercase tracking-wide">Suggested Caption</h4>
                                <button className="text-xs text-primary hover:text-white transition-colors">Copy</button>
                             </div>
                             <p className="text-sm leading-relaxed text-slate-200 mb-4">{imageAnalysis.caption}</p>
                             <div className="flex flex-wrap gap-2">
                                 {imageAnalysis.hashtags.map(tag => (
                                     <span key={tag} className="text-xs bg-slate-800 text-indigo-300 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer">
                                         {tag}
                                     </span>
                                 ))}
                             </div>
                        </div>
                    </div>
                ) : videoAnalysis ? (
                    // VIDEO ANALYSIS RENDER
                    <div className="animate-fade-in space-y-6">
                        {/* Viral Score Header */}
                        <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-xl p-6 border border-red-500/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-red-200 font-medium text-sm mb-1">Virality Potential</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{videoAnalysis.viralityScore}</span>
                                    <span className="text-red-300">/10</span>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-950">
                                <i className="fa-solid fa-fire text-2xl text-orange-400"></i>
                            </div>
                        </div>

                        {/* Summary & Hook */}
                        <div className="bg-surface border border-slate-700 rounded-xl p-5">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Video Summary</h4>
                            <p className="text-sm text-slate-300 mb-4">{videoAnalysis.summary}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <h5 className="text-[10px] font-bold text-muted uppercase mb-1">The Hook</h5>
                                    <p className="text-xs text-white leading-tight">{videoAnalysis.hookAnalysis}</p>
                                </div>
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <h5 className="text-[10px] font-bold text-muted uppercase mb-1">Pacing</h5>
                                    <p className="text-xs text-white leading-tight">{videoAnalysis.pacing}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Repurposing (Tweets) */}
                        <div className="bg-surface border border-slate-700 rounded-xl p-5">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-muted uppercase tracking-wide flex items-center gap-2">
                                    <i className="fa-solid fa-recycle text-primary"></i> Content Remix
                                </h4>
                             </div>
                             <div className="space-y-3">
                                 {videoAnalysis.generatedTweets.map((tweet, i) => (
                                     <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
                                         <div className="flex justify-between items-start mb-1">
                                             <i className="fa-brands fa-twitter text-blue-400 text-xs"></i>
                                             <button className="text-[10px] text-muted hover:text-white">Copy</button>
                                         </div>
                                         <p className="text-xs text-slate-200">{tweet}</p>
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Suggested Caption */}
                        <div className="bg-surface border border-slate-700 rounded-xl p-5">
                             <h4 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">Optimized Caption</h4>
                             <p className="text-sm leading-relaxed text-slate-200 bg-slate-900/50 p-3 rounded border border-slate-700">
                                 {videoAnalysis.suggestedCaption}
                             </p>
                        </div>
                    </div>
                ) : (
                    activeTab === 'analyze' && <EmptyState icon="fa-magnifying-glass-chart" message="Upload media to unlock deep insights." />
                )
            )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-surface">
            {activeTab === 'analyze' ? (
                 <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors shadow-lg border border-slate-600">
                    Export Analysis Report
                </button>
            ) : (
                <button className="w-full py-3 bg-secondary hover:bg-emerald-600 rounded-lg font-bold transition-colors shadow-lg">
                    Schedule {activeTab === 'text' ? 'Post' : activeTab === 'image' ? 'Image' : activeTab === 'video' ? 'Video' : 'Voiceover'}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};