
import React, { useState } from 'react';
import { Page, SigmaNiche } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OmniCortex } from './components/OmniCortex';
import { CommandPalette } from './components/CommandPalette';
import { NeuralPulse } from './components/NeuralPulse';

// --- Page Imports ---
import { Dashboard } from './pages/Dashboard';
import { ProtocolSigma } from './pages/ProtocolSigma';
import { ProtocolAlpha } from './pages/ProtocolAlpha';
import { ProtocolDelta } from './pages/ProtocolDelta';
import { ProtocolGamma } from './pages/ProtocolGamma';
import { ContentStudio } from './pages/ContentStudio';
import { Scheduler } from './pages/Scheduler';
import { Analytics } from './pages/Analytics';
import { SmartInbox } from './pages/SmartInbox';
import { BusinessOps } from './pages/BusinessOps';
import { TrendDiscovery } from './pages/TrendDiscovery';
import { LiveStrategy } from './pages/LiveStrategy';
import { BrandGuard } from './pages/BrandGuard';
import { LocationScout } from './pages/LocationScout';
import { ResearchLab } from './pages/ResearchLab';
import { AssetVault } from './pages/AssetVault';
import { CompetitorWatch } from './pages/CompetitorWatch';
import { PartnerNetwork } from './pages/PartnerNetwork';
import { PersonaLab } from './pages/PersonaLab';
import { Multiplier } from './pages/Multiplier';
import { Globalize } from './pages/Globalize';
import { NeuralFlows } from './pages/NeuralFlows';
import { Boardroom } from './pages/Boardroom';
import { FusionReactor } from './pages/FusionReactor';
import { TheNexus } from './pages/TheNexus';
import { ViralDNA } from './pages/ViralDNA';
import { TimeCapsule } from './pages/TimeCapsule';
import { TheDojo } from './pages/TheDojo';
import { InnerCircle } from './pages/InnerCircle';
import { Launchpad } from './pages/Launchpad';
import { TheBlueprint } from './pages/TheBlueprint';
import { Adrenaline } from './pages/Adrenaline';
import { ThePitch } from './pages/ThePitch';
import { QuantumFeed } from './pages/QuantumFeed';
import { TheMirror } from './pages/TheMirror';
import { TheHorizon } from './pages/TheHorizon';
import { TheDeep } from './pages/TheDeep';
import { ThePrism } from './pages/ThePrism';
import { TheOracle } from './pages/TheOracle';
import { TheConstruct } from './pages/TheConstruct';
import { TheStylist } from './pages/TheStylist';
import { TheCurator } from './pages/TheCurator';
import { TheShowrunner } from './pages/TheShowrunner';
import { TheAcademy } from './pages/TheAcademy';
import { TheStoryboard } from './pages/TheStoryboard';
import { TheScribe } from './pages/TheScribe';
import { TheCodex } from './pages/TheCodex';
import { TheHive } from './pages/TheHive';
import { TheAlchemist } from './pages/TheAlchemist';
import { TheNegotiator } from './pages/TheNegotiator';
import { TheCatalyst } from './pages/TheCatalyst';
import { TheCartographer } from './pages/TheCartographer';
import { TheMosaic } from './pages/TheMosaic';
import { TheKaleidoscope } from './pages/TheKaleidoscope';
import { TheResonator } from './pages/TheResonator';
import { TheVerdict } from './pages/TheVerdict';
import { TheLoom } from './pages/TheLoom';
import { TheBiome } from './pages/TheBiome';
import { TheFrequency } from './pages/TheFrequency';
import { TheDirector } from './pages/TheDirector';
import { TheSyndicate } from './pages/TheSyndicate';
import { TheSignal } from './pages/TheSignal';
import { TheEcho } from './pages/TheEcho';
import { TheTerminal } from './pages/TheTerminal';
import { TheSentinel } from './pages/TheSentinel';
import { TheArchive } from './pages/TheArchive';
import { TheWarRoom } from './pages/TheWarRoom';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [activeNiche, setActiveNiche] = useState<SigmaNiche | null>(null);
    const [sharedTopic, setSharedTopic] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isCortexOpen, setIsCortexOpen] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    const handlePromoteToAlpha = (niche: SigmaNiche) => {
        setActiveNiche(niche);
        setCurrentPage('alpha');
    };

    const handleDraftPost = (topic: string) => {
        setSharedTopic(topic);
        setCurrentPage('studio');
    };

    const renderPage = () => {
        switch (currentPage) {
            // COMMAND
            case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
            case 'war-room': return <TheWarRoom />;
            case 'sigma': return <ProtocolSigma onPromote={handlePromoteToAlpha} />;
            case 'alpha': return <ProtocolAlpha activeNiche={activeNiche} />;
            case 'delta': return <ProtocolDelta />;
            case 'sentinel': return <TheSentinel />;
            
            // STUDIO
            case 'studio': return <ContentStudio initialTopic={sharedTopic} />;
            case 'director': return <TheDirector />;
            case 'frequency': return <TheFrequency />;
            case 'scribe': return <TheScribe />;
            case 'storyboard': return <TheStoryboard />;
            case 'adrenaline': return <Adrenaline />;
            case 'gamma': return <ProtocolGamma />;
            case 'echo': return <TheEcho />;

            // INTELLIGENCE
            case 'trends': return <TrendDiscovery onDraftPost={handleDraftPost} />;
            case 'scout': return <LocationScout onDraftPost={handleDraftPost} />;
            case 'resonator': return <TheResonator />;
            case 'verdict': return <TheVerdict />;
            case 'mosaic': return <TheMosaic />;
            case 'archive': return <TheArchive />;
            case 'nexus': return <TheNexus />;
            case 'partners': return <PartnerNetwork />;
            case 'competitors': return <CompetitorWatch />;
            case 'personas': return <PersonaLab />;
            case 'research': return <ResearchLab />;

            // STRATEGY
            case 'boardroom': return <Boardroom />;
            case 'horizon': return <TheHorizon />;
            case 'deep': return <TheDeep />;
            case 'prism': return <ThePrism />;
            case 'oracle': return <TheOracle />;
            case 'catalyst': return <TheCatalyst />;
            case 'negotiator': return <TheNegotiator />;
            case 'cartographer': return <TheCartographer />;
            case 'blueprint': return <TheBlueprint />;
            case 'launchpad': return <Launchpad />;
            case 'strategy': return <LiveStrategy />;

            // SYSTEMS & OTHERS
            case 'terminal': return <TheTerminal onNavigate={setCurrentPage} />;
            case 'syndicate': return <TheSyndicate />;
            case 'settings': return <Settings />;
            case 'academy': return <TheAcademy />;
            case 'codex': return <TheCodex />;
            case 'hive': return <TheHive />;
            case 'ops': return <BusinessOps />;
            case 'brand-guard': return <BrandGuard />;
            
            // ADDITIONAL TOOLS
            case 'scheduler': return <Scheduler />;
            case 'inbox': return <SmartInbox />;
            case 'analytics': return <Analytics />;
            case 'vault': return <AssetVault onNavigate={setCurrentPage} />;
            case 'multiplier': return <Multiplier />;
            case 'globalize': return <Globalize />;
            case 'flows': return <NeuralFlows />;
            case 'fusion': return <FusionReactor />;
            case 'dna': return <ViralDNA />;
            case 'capsule': return <TimeCapsule />;
            case 'dojo': return <TheDojo />;
            case 'circle': return <InnerCircle />;
            case 'loom': return <TheLoom />;
            case 'biome': return <TheBiome />;
            case 'construct': return <TheConstruct />;
            case 'kaleidoscope': return <TheKaleidoscope />;
            case 'pitch': return <ThePitch />;
            case 'mirror': return <TheMirror />;
            case 'quantum': return <QuantumFeed />;
            case 'alchemist': return <TheAlchemist />;
            case 'signal': return <TheSignal />;
            case 'curator': return <TheCurator />;
            case 'showrunner': return <TheShowrunner />;
            case 'stylist': return <TheStylist />;

            default: return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden font-sans text-sm">
            <Sidebar 
                currentPage={currentPage} 
                onNavigate={setCurrentPage} 
                isOpen={isSidebarOpen} 
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header 
                    title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace(/-/g, ' ')} 
                    onOpenPalette={() => setIsPaletteOpen(true)}
                    onToggleCortex={() => setIsCortexOpen(!isCortexOpen)}
                />
                <main className="flex-1 overflow-y-auto p-6 bg-slate-950 custom-scrollbar">
                    {renderPage()}
                </main>
                <NeuralPulse currentPage={currentPage} />
            </div>
            <OmniCortex 
                isOpen={isCortexOpen} 
                onClose={() => setIsCortexOpen(false)} 
                currentPage={currentPage} 
            />
            <CommandPalette 
                isOpen={isPaletteOpen} 
                onClose={() => setIsPaletteOpen(false)} 
                onNavigate={setCurrentPage} 
            />
        </div>
    );
};

export default App;
