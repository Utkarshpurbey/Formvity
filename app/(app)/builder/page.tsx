"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BuilderSidebar from "../../../src/components/page-def/builder/BuilderSidebar";
import PageCanvas from "../../../src/components/page-def/builder/PageCanvas";
import ComponentConfigPanel from "../../../src/components/page-def/builder/ComponentConfigPanel";
import { PublishFlowModal } from "../../../src/components/publish/PublishFlowModal";
import { PageLoader } from "../../../src/components/ui/index";
import { isEditableFormLifecycle } from "../../../src/lib/publish";
import { resolveRespondentIntake } from "../../../src/lib/respondentIntake";
import { useBuilderPage } from "../../../src/hooks/useBuilderPage";
import { BuilderTopBar } from "../../../src/components/page-def/builder/BuilderTopBar";
import { IntakeConfigPanel } from "../../../src/components/page-def/builder/IntakeConfigPanel";
import { BuilderGuideModal } from "../../../src/components/page-def/builder/BuilderGuideModal";
import { BuilderPreview } from "../../../src/components/page-def/builder/BuilderPreview";
import { AiBuilderChatbot } from "../../../src/components/page-def/builder/AiBuilderChatbot";

function BuilderPageInner() {
  const searchParams = useSearchParams();
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  const {
    apiMode,
    loaded,
    loadBlocked,
    formDef,
    setFormDef,
    activePage,
    activePageId,
    setActivePageId,
    pageIndex,
    isLastPage,
    isFirstPage,
    selectedId,
    setSelectedId,
    selectedComponent,
    showJson,
    setShowJson,
    jsonInput,
    setJsonInput,
    jsonError,
    saveState,
    lifecycle,
    saving,
    publishing,
    publishModalOpen,
    publishModalMode,
    publishError,
    lastPublishResult,
    existingSlug,
    existingPublicUrl,
    updateActivePage,
    deleteSelected,
    handleSave,
    openPublishModal,
    closePublishModal,
    handlePublish,
    formFromList,
    builderMode,
    setBuilderMode,
    previewOpen,
    setPreviewOpen,
    guideOpen,
    dismissGuide,
    openGuide,
    updateRespondentIntake,
    intakeIsDefault,
  } = useBuilderPage();

  useEffect(() => {
    if (searchParams.get("ai") === "true") {
      setBuilderMode("ai");
    }
  }, [searchParams, setBuilderMode]);

  const intake = resolveRespondentIntake(formDef);

  if (apiMode && !loaded) {
    return <PageLoader message="Loading form…" className="bg-gradient-to-br from-slate-100 to-violet-50" />;
  }

  if (apiMode && loadBlocked) {
    return <PageLoader message="Redirecting…" className="bg-gradient-to-br from-slate-100 to-violet-50" />;
  }

  if (apiMode && formFromList && lifecycle && !isEditableFormLifecycle(lifecycle)) {
    return <PageLoader message="Redirecting…" className="bg-gradient-to-br from-slate-100 to-violet-50" />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-violet-50/80">
      {/* Sidebar - Switches between AI Copilot Chatbot, Intake, or Component Palette */}
      <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white shadow-sm">
        {builderMode === "ai" ? (
          <AiBuilderChatbot
            embedded
            currentFormDef={formDef}
            onApplyFormDef={(newDef) => {
              setFormDef(newDef);
              if (newDef.pages[0]) {
                setActivePageId(newDef.pages[0].id);
              }
            }}
            onOpenPublish={() => openPublishModal("publish")}
            onOpenJson={() => setShowJson(true)}
          />
        ) : builderMode === "intake" ? (
          <IntakeConfigPanel intake={intake} onChange={updateRespondentIntake} />
        ) : (
          <BuilderSidebar
            formDef={formDef}
            activePageId={activePageId}
            onActivePageChange={setActivePageId}
            onFormDefChange={setFormDef}
            onClearSelection={() => setSelectedId(null)}
          />
        )}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        <BuilderTopBar
          formTitle={formDef.title}
          saveState={saveState}
          apiMode={apiMode}
          lifecycle={apiMode ? lifecycle : null}
          builderMode={builderMode}
          intakeIsDefault={intakeIsDefault}
          showJson={showJson}
          saving={saving}
          publishing={publishing}
          onModeChange={setBuilderMode}
          onToggleJson={() => setShowJson((v) => !v)}
          onSave={handleSave}
          onPublish={() => openPublishModal("publish")}
          onShare={() => openPublishModal("share")}
          onUpdateLive={() => openPublishModal("republish")}
          onPreview={() => setPreviewOpen(true)}
          onOpenGuide={openGuide}
          onOpenAiModal={() => setBuilderMode("ai")}
        />

        {builderMode === "intake" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-white/60 p-8 text-center">
            <p className="text-sm font-medium text-slate-800">Intake configuration is in the left panel</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Respondents always see an intake step first — defaulting to name and email unless you customize it here.
            </p>
            <button
              type="button"
              onClick={() => setBuilderMode("pages")}
              className="mt-6 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Continue to form pages
            </button>
          </div>
        ) : !showJson ? (
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/40 shadow-inner">
            <PageCanvas
              key={activePage.id}
              formDef={formDef}
              page={activePage}
              pageIndex={pageIndex}
              totalPages={formDef.pages.length}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onFormDefChange={setFormDef}
              onPageChange={updateActivePage}
              isLastPage={isLastPage}
              isFirstPage={isFirstPage}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3">
              <span className="text-sm text-slate-600">FormDef JSON — includes respondentIntake when customized</span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full flex-1 resize-none bg-slate-50 p-4 font-mono text-sm text-slate-800 focus:outline-none"
              spellCheck={false}
            />
            {jsonError ? (
              <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">{jsonError}</p>
            ) : null}
          </div>
        )}
      </main>

      <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white shadow-sm">
        {builderMode === "pages" || builderMode === "ai" ? (
          <ComponentConfigPanel
            formDef={formDef}
            selectedComponent={selectedComponent}
            onFormDefChange={setFormDef}
            onPageChange={updateActivePage}
            onClearSelection={() => setSelectedId(null)}
            onDeleteSelected={selectedId ? deleteSelected : undefined}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-sm text-slate-500">
            Switch to Form pages to configure field properties.
          </div>
        )}
      </aside>

      {/* Floating Chatbot option when not in sidebar AI mode */}
      {builderMode !== "ai" ? (
        <AiBuilderChatbot
          open={floatingChatOpen}
          onToggle={() => setFloatingChatOpen((o) => !o)}
          currentFormDef={formDef}
          onApplyFormDef={(newDef) => {
            setFormDef(newDef);
            if (newDef.pages[0]) {
              setActivePageId(newDef.pages[0].id);
            }
          }}
          onOpenPublish={() => openPublishModal("publish")}
          onOpenJson={() => setShowJson(true)}
        />
      ) : null}

      {apiMode ? (
        <PublishFlowModal
          open={publishModalOpen}
          mode={publishModalMode}
          formDef={formDef}
          existingSlug={existingSlug}
          existingPublicUrl={existingPublicUrl}
          publishing={publishing}
          onClose={closePublishModal}
          onPublish={handlePublish}
          publishResult={lastPublishResult}
          error={publishError}
        />
      ) : null}

      <BuilderGuideModal open={guideOpen} onClose={dismissGuide} />
      <BuilderPreview open={previewOpen} formDef={formDef} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<PageLoader message="Opening builder…" className="bg-gradient-to-br from-slate-100 to-violet-50" />}>
      <BuilderPageInner />
    </Suspense>
  );
}
