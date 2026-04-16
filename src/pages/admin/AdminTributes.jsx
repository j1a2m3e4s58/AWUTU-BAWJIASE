import React from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminTributes() {
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ['admin-tributes'],
    queryFn: () => firebaseApi.entities.TributeMessage.list('-created_date'),
    initialData: [],
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => firebaseApi.entities.TributeMessage.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tributes'] }); toast.success('Updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => firebaseApi.entities.TributeMessage.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tributes'] }); toast.success('Deleted'); },
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-sidebar-foreground mb-6">Tributes</h2>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-sidebar-accent rounded-lg border border-sidebar-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-sidebar-foreground italic">"{item.message}"</p>
                <p className="text-xs text-sidebar-primary mt-2">— {item.author_name}</p>
                <p className="text-xs text-sidebar-foreground/40 mt-1">
                  {item.created_date && new Date(item.created_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateMut.mutate({ id: item.id, data: { published: !item.published } })}
                  className="h-8 w-8"
                >
                  {item.published ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-sidebar-foreground/40" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(item.id)} className="h-8 w-8 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-sidebar-foreground/50 py-8">No tributes yet.</p>}
      </div>
    </div>
  );
}