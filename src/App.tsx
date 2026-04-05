import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Page } from './components/Page';
import { Toolbar } from './components/Toolbar';
import type { PageData } from './types';
import { ToolType } from './types';
import { generatePage, TOTAL_PAGES } from './constants';
import { Loader2, Heart, LogOut } from 'lucide-react';
import { savePagesToCloud, subscribeToPages, loadPagesFromCloud, uploadImage, auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PairingScreen } from './components/PairingScreen';

const SAVE_DEBOUNCE_MS = 2000;

function initPages(): PageData[] {
  return Array.from({ length: TOTAL_PAGES }, (_, i) => generatePage(i));
}

function Scrapbook({ coupleId, onSignOut }: { coupleId: string, onSignOut: () => void }) {
  const [pages, setPages] = useState<PageData[]>(initPages);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.PEN);
  const [color, setColor] = useState('#4B5563');
  const [brushSize, setBrushSize] = useState(3);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdate = useRef(false);

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = Math.max(300, window.innerWidth - 40);
      const h = Math.max(400, window.innerHeight - 40);
      return { width: w, height: h };
    }
    return { width: 800, height: 600 };
  });

  // Responsive resize
  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const w = Math.max(300, window.innerWidth - 40);
      const h = Math.max(400, window.innerHeight - 40);
      setDimensions({ width: w, height: h });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Firebase load + realtime sync
  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      try {
        const cloudPages = await loadPagesFromCloud(coupleId);
        if (cloudPages && cloudPages.length > 0) {
          // Remove legacy dummy white/polaroid photo boxes from old sessions
          const cleanedPages = cloudPages.map(page => ({
            ...page,
            objects: page.objects.filter(obj => !(obj.type === 'image' && obj.content === ''))
          }));
          setPages(cleanedPages);
        }
      } catch (e) {
        console.warn('Offline or Firebase not configured, using local pages.');
      } finally {
        setIsLoading(false);
      }
      try {
        unsub = subscribeToPages(coupleId, (cloudPages) => {
          if (isRemoteUpdate.current) return;
          isRemoteUpdate.current = true;
          setPages(cloudPages);
          setTimeout(() => { isRemoteUpdate.current = false; }, 500);
        });
      } catch (e) {
        console.warn('Realtime sync unavailable.');
      }
    })();
    return () => { unsub?.(); };
  }, []);

  // Debounced cloud save
  const debouncedSave = useCallback((updatedPages: PageData[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSyncing(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isRemoteUpdate.current = true;
        await savePagesToCloud(coupleId, updatedPages);
        setTimeout(() => { isRemoteUpdate.current = false; }, 500);
      } catch (e) {
        console.warn('Save failed, will retry...');
      } finally {
        setIsSyncing(false);
      }
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const updatePage = useCallback((id: string, data: Partial<PageData>) => {
    setPages((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      debouncedSave(next);
      return next;
    });
  }, [debouncedSave]);

  // Undo: remove last stroke from current page
  const handleUndo = useCallback(() => {
    const page = pages[currentPageIndex];
    if (!page || page.strokes.length === 0) return;
    updatePage(page.id, { strokes: page.strokes.slice(0, -1) });
  }, [pages, currentPageIndex, updatePage]);

  // Add photo via file picker
  const handleAddImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const page = pages[currentPageIndex];
    if (!page) return;
    
    const newObjects = [...page.objects];
    let xOffset = 0;
    for (const file of files) {
      let url: string;
      try {
        url = await uploadImage(file, coupleId);
      } catch {
        url = URL.createObjectURL(file);
      }
      newObjects.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'image',
        content: url,
        x: dimensions.width * 0.05 + xOffset,
        y: dimensions.height * 0.15,
        width: Math.min(dimensions.width * 0.38, 280),
        height: 0,
        rotation: (Math.random() * 10) - 5,
        zIndex: 10 + newObjects.length,
      });
      xOffset += 20;
    }
    updatePage(page.id, { objects: newObjects });
    setActiveTool(ToolType.CURSOR);
    e.target.value = '';
  }, [pages, currentPageIndex, dimensions, updatePage]);

  const handleAddSticker = useCallback((url: string) => {
    const page = pages[currentPageIndex];
    if (!page) return;
    
    const newObjects = [...page.objects];
    newObjects.push({
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'image',
      content: url,
      x: dimensions.width * 0.4 + (Math.random() * 40 - 20),
      y: dimensions.height * 0.4 + (Math.random() * 40 - 20),
      width: Math.min(dimensions.width * 0.25, 120),
      height: 0,
      rotation: (Math.random() * 30) - 15,
      zIndex: 10 + newObjects.length,
    });
    
    updatePage(page.id, { objects: newObjects });
    setActiveTool(ToolType.CURSOR);
  }, [pages, currentPageIndex, dimensions, updatePage]);

  const handleAddPage = useCallback(() => {
    setPages((prev) => {
      const next = [...prev, generatePage(prev.length)];
      debouncedSave(next);
      return next;
    });
  }, [debouncedSave]);

  const onFlip = useCallback((e: any) => {
    setCurrentPageIndex(e.data);
  }, []);

  const flipTo = useCallback((index: number) => {
    if (!bookRef.current) return;
    const pageFlip = bookRef.current.pageFlip();
    if (pageFlip) {
      pageFlip.flip(index);
    }
  }, []);

  const showBook = dimensions.width > 0 && pages.length > 0 && !isLoading;
  const currentPage = pages[currentPageIndex];
  const canUndo = (currentPage?.strokes.length || 0) > 0;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)' }}>
        <div className="flex items-center gap-3 text-white/80">
          <Heart className="w-6 h-6 animate-pulse text-pink-400" />
          <span className="font-['Caveat'] text-2xl tracking-wide">Loading your memories…</span>
          <Heart className="w-6 h-6 animate-pulse text-pink-400" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden touch-none"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a0a2e 100%)' }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-white/70"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <Loader2 size={10} className="animate-spin" />
          <span className="font-['Caveat']">Saving…</span>
        </div>
      )}

      {/* Couple header */}
      <div className="fixed top-3 w-full px-5 flex justify-between items-center z-50 pointer-events-none">
        <div className="w-8"></div>
        <span className="font-['Pacifico'] text-white/30 text-sm tracking-widest select-none">
          our scrapbook
        </span>
        <button onClick={onSignOut} className="pointer-events-auto text-white/20 hover:text-white/80 transition-colors" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>

      {/* FlipBook */}
      {showBook && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ paddingBottom: 72 }}
        >
          <HTMLFlipBook
            key="stable-book"
            width={dimensions.width}
            height={dimensions.height - 72}
            size="fixed"
            minWidth={300}
            maxWidth={10000}
            minHeight={400}
            maxHeight={10000}
            maxShadowOpacity={0.85}
            showCover={true}
            mobileScrollSupport={true}
            className="shadow-2xl rounded-lg"
            onFlip={onFlip}
            ref={bookRef}
            style={{ margin: "0 auto", position: "relative", width: '100%', height: '100%' }}
            startPage={currentPageIndex}
            drawShadow={true}
            flippingTime={800}
            usePortrait={true}
            useMouseEvents={true}
            swipeDistance={100}
            showPageCorners={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={false}
            disableFlipByClick={true}
          >
            {pages.map((pageData, index) => {
              const isNearby = Math.abs(index - currentPageIndex) <= 3;
              return (
                <div key={pageData.id} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {isNearby ? (
                    <Page
                      pageData={pageData}
                      activeTool={activeTool}
                      color={color}
                      brushSize={brushSize}
                      onUpdatePage={updatePage}
                      width={dimensions.width} 
                      height={dimensions.height - 72}
                      pageIndex={index}
                    />
                  ) : (
                    <div
                      style={{ width: '100%', height: '100%', background: pageData.backgroundColor, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40 }}
                    >
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: '1.1rem', color: '#7c3aed', opacity: 0.4 }}>
                        {new Date(pageData.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </HTMLFlipBook>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        penType={activeTool as any}
        setPenType={() => {}}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onUndo={handleUndo}
        onAddImage={handleAddImage}
        onAddSticker={handleAddSticker}
        onAddPage={handleAddPage}
        currentPage={currentPageIndex}
        totalPages={pages.length}
        onFlipTo={flipTo}
        canUndo={canUndo}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setAuthChecking(false);
        setCoupleId(null);
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().coupleId) {
        setCoupleId(docSnap.data().coupleId);
      } else {
        setCoupleId(null);
      }
      setAuthChecking(false);
    });
    return unsubUser;
  }, [user]);

  if (authChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center touch-none" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)' }}>
         <Heart className="w-12 h-12 text-pink-400 animate-pulse drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]" />
      </div>
    );
  }

  if (!user) return <WelcomeScreen />;
  if (!coupleId) return <PairingScreen userId={user.uid} onSignOut={() => auth.signOut()} />;

  return <Scrapbook coupleId={coupleId} onSignOut={() => auth.signOut()} />;
}
