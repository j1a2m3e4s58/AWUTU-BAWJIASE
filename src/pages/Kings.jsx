import React, { useState } from 'react';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHero from '../components/shared/PageHero';
import { KingCardSkeleton } from '../components/shared/LoadingSkeleton';
import { useLanguage } from '@/lib/LanguageContext';

const ARTIFACTS_IMAGE = 'https://media.base44.com/images/public/69de42095e2296b1a9a58aa1/bffc1cf8d_generated_64e10ec5.png';

export default function Kings() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: kings, isLoading } = useQuery({
    queryKey: ['kings'],
    queryFn: () => firebaseApi.entities.King.filter({ published: true }, 'order'),
    initialData: [],
  });

  const filtered = kings.filter((k) => {
    const searchText = `${k.name || ''} ${k.title || ''} ${k.stool_role || ''} ${k.summary || ''}`.toLowerCase();
    const matchSearch = searchText.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || k.status === statusFilter;
    const matchRole = roleFilter === 'all' || (k.role_group || 'king') === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  return (
    <div>
      <PageHero
        label={t('corridorOfKings')}
        title="Leadership Directory"
        description="A public directory of kings, chiefs, queen mothers, elders, council members, and important community figures."
        imageUrl={ARTIFACTS_IMAGE}
        pageKey="leadership"
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchKings')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-card">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="reigning">{t('reigning')}</SelectItem>
                <SelectItem value="deceased">{t('deceased')}</SelectItem>
                <SelectItem value="abdicated">{t('abdicated')}</SelectItem>
                <SelectItem value="future">{t('future')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-56 bg-card">
                <SelectValue placeholder="All Leadership Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leadership Roles</SelectItem>
                <SelectItem value="king">Kings</SelectItem>
                <SelectItem value="chief">Chiefs</SelectItem>
                <SelectItem value="queen_mother">Queen Mothers</SelectItem>
                <SelectItem value="elder">Elders</SelectItem>
                <SelectItem value="council_member">Council Members</SelectItem>
                <SelectItem value="important_figure">Important Figures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <KingCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noKingsFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((king, i) => (
                <motion.div
                  key={king.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link
                    to={`/kings/${king.id}`}
                    className="group block bg-card border border-border/50 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-500"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                      {king.photo_url ? (
                        <img
                          src={king.photo_url}
                          alt={king.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Crown className="w-16 h-16 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="text-xs uppercase tracking-wider text-primary-foreground/80">
                                {t('viewLegacy')}
                              </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${
                          king.status === 'reigning' ? 'bg-green-500' :
                          king.status === 'deceased' ? 'bg-muted-foreground/40' :
                          king.status === 'future' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          {(king.role_group || 'king').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">
                        {king.name}
                      </h3>
                      {(king.title || king.stool_role) && (
                        <p className="text-sm text-muted-foreground mt-1">{king.title || king.stool_role}</p>
                      )}
                      {king.summary && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{king.summary}</p>
                      )}
                      {(king.reign_start || king.reign_end) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {king.reign_start && new Date(king.reign_start).getFullYear()}
                          {' — '}
                          {king.reign_end ? new Date(king.reign_end).getFullYear() : t('present')}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
