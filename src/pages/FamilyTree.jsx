import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import PageHero from '../components/shared/PageHero';

const statusColors = {
  reigning: 'border-green-500 bg-green-500/10',
  deceased: 'border-muted-foreground/30 bg-card',
  abdicated: 'border-yellow-500/50 bg-yellow-500/5',
  future: 'border-blue-500/50 bg-blue-500/5',
};

export default function FamilyTree() {
  const [hovered, setHovered] = useState(null);

  const { data: kings } = useQuery({
    queryKey: ['lineage-tree'],
    queryFn: () => firebaseApi.entities.King.filter({ published: true }, 'order'),
    initialData: [],
  });

  return (
    <div>
      <PageHero
        label="Royal Lineage"
        title="Family Tree"
        description="The visual lineage of the Awutu Bawjiase royal dynasty across generations."
      />

      <section className="py-16 lg:py-28 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {kings.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No lineage data available.</p>
          )}

          {/* Vertical tree with connector lines */}
          <div className="relative flex flex-col items-center gap-0">
            {kings.map((king, i) => (
              <React.Fragment key={king.id}>
                {/* Node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative z-10"
                  onMouseEnter={() => setHovered(king.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link to={`/kings/${king.id}`}>
                    <div className={`flex items-center gap-6 p-5 border-2 rounded-sm transition-all duration-300 w-full max-w-sm cursor-pointer ${statusColors[king.status] || statusColors.deceased} ${hovered === king.id ? 'shadow-xl -translate-y-0.5' : ''}`}>
                      {king.photo_url ? (
                        <img src={king.photo_url} alt={king.name} className="w-14 h-14 rounded-full object-cover shrink-0 shadow-md" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Crown className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                      <div>
                        <p className="font-display text-base font-semibold text-foreground">{king.name}</p>
                        {king.title && <p className="text-xs text-primary">{king.title}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {king.reign_start ? new Date(king.reign_start).getFullYear() : '?'}
                          {' — '}
                          {king.reign_end ? new Date(king.reign_end).getFullYear() : king.status === 'reigning' ? 'Present' : '?'}
                        </p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${
                          king.status === 'reigning' ? 'border-green-500 text-green-600' :
                          king.status === 'future' ? 'border-blue-500 text-blue-500' :
                          'border-muted-foreground/30 text-muted-foreground'
                        }`}>
                          {king.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Connector line */}
                {i < kings.length - 1 && (
                  <div className="w-0.5 h-10 bg-primary/30 z-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}