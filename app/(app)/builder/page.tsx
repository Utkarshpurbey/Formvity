"use client";

import { Suspense } from "react";
import BuilderSidebar from "../../../src/components/page-def/builder/BuilderSidebar";
import { BuilderTopBar } from "../../../src/components/page-def/builder/BuilderTopBar";
import PageCanvas from "../../../src/components/page-def/builder/PageCanvas";
import ComponentConfigPanel from "../../../src/components/page-def/builder/ComponentConfigPanel";
import { PublishFlowModal } from "../../../src/components/publish/PublishFlowModal";
import { PageLoader } from "../../../src/components/ui/index";
import { isEditableFormLifecycle } from "../../../src/lib/publish";
import { useBuilderPage } from "../../../src/hooks/useBuilderPage";

function BuilderPageInner() {
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
  } = useBuilderPage();

  if (apiMode && !loaded) {
    return <PageLoader message="Loading form from server…" className="bg-slate-100" />;
  }

  if (apiMode && loadBlocked) {
    return <PageLoader message="Redirecting…" className="bg-slate-100" />;
  }

  if (apiMode && formFromList && !isEditableFormLifecycle(lifecycle)) {
    return <PageLoader message="Redirecting…" className="bg-slate-100" />;
  }

  return (
    <div className="flex min-h-0 flex-1 bg-slate-100">
      <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm">
        <BuilderSidebar
          formDef={formDef}
          activePageId={activePageId}
          onActivePageChange={setActivePageId}
          onFormDefChange={setFormDef}
          onClearSelection={() => setSelectedId(null)}
        />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden p-4">
        <BuilderTopBar
          formTitle={formDef.title}
          saveState={saveState}
          apiMode={apiMode}
          lifecycle={apiMode ? lifecycle : null}
          showJson={showJson}
          onToggleJson={() => setShowJson((v) => !v)}
          onSave={handleSave}
          onPublish={() => openPublishModal("publish")}
          onShare={() => openPublishModal("share")}
          onUpdateLive={() => openPublishModal("republish")}
          saving={saving}
          publishing={publishing}
        />
        {!showJson ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
              <span className="text-sm text-slate-600">FormDef JSON — full document including all pages</span>
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
      <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm">
        <ComponentConfigPanel
          formDef={formDef}
          selectedComponent={selectedComponent}
          onFormDefChange={setFormDef}
          onPageChange={updateActivePage}
          onClearSelection={() => setSelectedId(null)}
          onDeleteSelected={selectedId ? deleteSelected : undefined}
        />
      </aside>

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
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<PageLoader message="Opening builder…" className="bg-slate-100" />}>
      <BuilderPageInner />
    </Suspense>
  );
}
