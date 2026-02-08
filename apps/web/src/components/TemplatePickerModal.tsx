import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListsStore } from '@/store/lists-store';

interface TemplatePickerModalProps {
  open: boolean;
  onClose: () => void;
}

export function TemplatePickerModal({ open, onClose }: TemplatePickerModalProps) {
  const templates = useListsStore((s) => s.templates);
  const fetchTemplates = useListsStore((s) => s.fetchTemplates);
  const createFromTemplate = useListsStore((s) => s.createFromTemplate);
  const navigate = useNavigate();

  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setError(null);
    }
  }, [open, fetchTemplates]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleCreate = async (templateId: string, templateTitle: string) => {
    if (creating) return;
    setCreating(templateId);
    setError(null);
    try {
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const newList = await createFromTemplate(templateId, `${templateTitle} - ${today}`);
      setCreating(null);
      if (newList) {
        onClose();
        navigate(`/list/${newList.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create list from template';
      setError(message);
      setCreating(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-picker-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <h2 id="template-picker-title" className="text-white font-bold text-lg">Create from Template</h2>
              <p className="text-text-secondary text-xs">Pick a saved template to start a new list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-accent-green"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {error && (
          <div className="px-5 pt-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-background-dark flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-text-secondary">bookmark</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">No templates saved yet</h3>
              <p className="text-text-secondary text-sm max-w-xs">
                Save a shopping list as a template from the active list view, then use it here to quickly create new lists.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {templates.map((template) => {
                const date = new Date(template.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const isCreating = creating === template.id;

                return (
                  <button
                    key={template.id}
                    onClick={() => handleCreate(template.id, template.title)}
                    disabled={!!creating}
                    className="group w-full text-left bg-background-dark hover:bg-accent-green/50 border border-border-dark hover:border-primary/40 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-[18px]">bookmark</span>
                          <h4 className="text-white font-semibold truncate">{template.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                            {template.itemCount} items
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {isCreating ? (
                          <span className="text-primary text-sm font-medium">Creating...</span>
                        ) : (
                          <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                            arrow_forward
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
