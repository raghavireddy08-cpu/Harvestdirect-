import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductListing } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Search,
  Flag,
  CopyCheck,
  Eye,
  Users,
} from 'lucide-react';
import { translateProduceName, translateCategoryName, translateUnitName } from '../i18n/translations';

export const AdminModerationView: React.FC = () => {
  const {
    products,
    moderateListing,
    unifiedUsers,
    toggleUserActiveStatus,
    toggleUserVerification,
    removeUser,
    language,
    t,
  } = useMarketplace();

  const [adminTab, setAdminTab] = useState<'users' | 'listings' | 'duplicates' | 'moderation'>('listings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'flagged' | 'active' | 'removed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [flaggingProductId, setFlaggingProductId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('Duplicate produce item detected for this farm');

  // Duplicate Detection: Group products by normalized name
  const duplicateCandidateMap = new Map<string, ProductListing[]>();
  products.forEach(p => {
    const norm = p.name.toLowerCase().trim();
    const list = duplicateCandidateMap.get(norm) || [];
    list.push(p);
    duplicateCandidateMap.set(norm, list);
  });

  const duplicateGroups: { name: string; items: ProductListing[] }[] = [];
  duplicateCandidateMap.forEach((items, name) => {
    if (items.length > 1) {
      duplicateGroups.push({ name, items });
    }
  });

  const duplicateCandidateIds = new Set<string>();
  duplicateGroups.forEach(g => g.items.forEach(item => duplicateCandidateIds.add(item.id)));

  // Filter listings
  const filteredProducts = products.filter(p => {
    if (filterStatus === 'flagged' && p.status !== 'flagged') return false;
    if (filterStatus === 'active' && p.status !== 'active') return false;
    if (filterStatus === 'removed' && p.status !== 'removed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.farmName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter users
  const filteredUsers = unifiedUsers.filter(u => {
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.secondaryInfo.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplyFlag = (productId: string) => {
    moderateListing(productId, 'flag', flagReason);
    setFlaggingProductId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span>{t('adminGovernanceSuite')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
            {t('adminDesk')}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {t('adminSuiteDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700">
            {t('registeredUsersCount')} <span className="font-bold tabular-nums">{unifiedUsers.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            {t('flaggedListingsCount')} <span className="font-bold tabular-nums">{products.filter(p => p.status === 'flagged').length}</span>
          </div>
        </div>
      </div>

      {/* Admin Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setAdminTab('listings')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'listings'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('tabMonitorListings')} ({products.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('tabManageUsers')} ({unifiedUsers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('duplicates')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'duplicates'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <CopyCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('tabDetectDuplicates')} ({duplicateGroups.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('moderation')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'moderation'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Flag className="w-3.5 h-3.5 text-rose-500" />
          <span>{t('tabModerateContent')}</span>
        </button>
      </div>

      {/* 1. MONITOR LISTINGS TAB */}
      {adminTab === 'listings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
              {(['all', 'flagged', 'active', 'removed'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                    filterStatus === st
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 font-semibold">
                    <th className="py-3 px-4">Produce Details</th>
                    <th className="py-3 px-4">Farm & Location</th>
                    <th className="py-3 px-4">Unit Price (₹)</th>
                    <th className="py-3 px-4">{t('availableStock')}</th>
                    <th className="py-3 px-4">Status & Flags</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map(prod => {
                    const isDup = duplicateCandidateIds.has(prod.id);
                    const localizedName = translateProduceName(prod.name, language);
                    const localizedCat = translateCategoryName(prod.category, language);
                    const localizedUnit = translateUnitName(prod.unit, language);

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.photoUrl}
                              alt={localizedName}
                              className="w-10 h-10 object-cover rounded-md bg-stone-100"
                            />
                            <div>
                              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                <span>{localizedName}</span>
                                {isDup && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1 rounded font-medium">
                                    Duplicate Match
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                {localizedCat} · Harvest: {prod.harvestDate}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-stone-700">
                          <div className="font-medium text-stone-900">{prod.farmName}</div>
                        </td>

                        <td className="py-3 px-4 font-bold text-stone-900 tabular-nums">
                          ₹{prod.price.toFixed(2)} / {localizedUnit}
                        </td>

                        <td className="py-3 px-4 tabular-nums text-stone-700">
                          {prod.availableQuantity} {localizedUnit}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              prod.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800'
                                : prod.status === 'flagged'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {prod.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {prod.status !== 'active' && (
                              <button
                                onClick={() => moderateListing(prod.id, 'approve')}
                                className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded font-medium"
                              >
                                {t('approveKeepBtn')}
                              </button>
                            )}

                            {prod.status !== 'flagged' && (
                              <button
                                onClick={() => setFlaggingProductId(prod.id)}
                                className="px-2 py-1 text-[11px] bg-amber-50 text-amber-800 hover:bg-amber-100 rounded font-medium"
                              >
                                Flag
                              </button>
                            )}

                            {prod.status !== 'removed' && (
                              <button
                                onClick={() => moderateListing(prod.id, 'remove', 'Violates policy')}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded"
                                title="Remove listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE USERS TAB */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search user name, phone, address..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="text-xs text-stone-500">
              Showing <span className="font-bold text-stone-800">{filteredUsers.length}</span> registered participant(s)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 font-semibold">
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">Contact Details</th>
                    <th className="py-3 px-4">{t('doorstepDeliveryAddress')}</th>
                    <th className="py-3 px-4">Status & Trust</th>
                    <th className="py-3 px-4">{t('myOrders')}</th>
                    <th className="py-3 px-4 text-right">{t('userManagementCol')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{user.name}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`font-semibold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                              user.role === 'farmer'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {user.role}
                          </span>
                          <span>{user.secondaryInfo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        <div>{user.phone}</div>
                        <div className="text-[11px] text-stone-400">{user.email}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-stone-700 line-clamp-2 leading-relaxed">
                          {user.address}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              user.isActive
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                          {user.isVerified && (
                            <div className="text-[10px] text-blue-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Member</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 tabular-nums text-stone-800 font-semibold">
                        {user.ordersCount}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleUserVerification(user.id)}
                            className="px-2 py-1 text-[11px] border border-stone-200 hover:bg-stone-100 rounded text-stone-700"
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </button>

                          <button
                            onClick={() => toggleUserActiveStatus(user.id)}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                              user.isActive
                                ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => removeUser(user.id)}
                            className="p-1 text-stone-400 hover:text-rose-700 rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. DETECT DUPLICATES TAB */}
      {adminTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <CopyCheck className="w-4 h-4 text-amber-700" />
              <span>{t('duplicateEngineTitle')}</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              {t('duplicateEngineDesc')}
            </p>
          </div>

          {duplicateGroups.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <div className="text-sm font-bold text-stone-800">{t('zeroDuplicatesFound')}</div>
              <p className="text-xs text-stone-500">All current listings have unique produce configurations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateGroups.map(group => (
                <div
                  key={group.name}
                  className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm capitalize">
                        Produce Match: "{translateProduceName(group.name, language)}"
                      </span>
                      <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                        {group.items.length} competing listings
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden text-xs">
                    {group.items.map(item => (
                      <div
                        key={item.id}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded bg-stone-200"
                          />
                          <div>
                            <div className="font-bold text-stone-900">{item.farmName}</div>
                            <div className="text-stone-500 text-[11px]">
                              {translateProduceName(item.name, language)} · ₹{item.price}/{translateUnitName(item.unit, language)} · Stock: {item.availableQuantity} {translateUnitName(item.unit, language)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              item.status === 'active'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {item.status}
                          </span>
                          <button
                            onClick={() => moderateListing(item.id, 'flag', 'Duplicate item check')}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-medium"
                          >
                            {t('flagAsDuplicateBtn')}
                          </button>
                          <button
                            onClick={() => moderateListing(item.id, 'remove', 'Removed duplicate listing')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded font-medium border border-rose-200"
                          >
                            {t('removeDuplicateBtn')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MODERATE CONTENT & INAPPROPRIATE TAB */}
      {adminTab === 'moderation' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
            <div className="font-bold text-rose-950 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>{t('inappropriateTitle')}</span>
            </div>
            <p className="text-rose-900">
              Review flagged items or remove inaccurate pricing, fake organic certifications, or misleading photos immediately.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-stone-900 text-sm">Currently Flagged Listings for Moderator Action</h3>
            {products.filter(p => p.status === 'flagged').length === 0 ? (
              <div className="py-8 text-center text-stone-500">
                No listings are currently flagged. The catalog is clean and compliant.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {products
                  .filter(p => p.status === 'flagged')
                  .map(p => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <span>{translateProduceName(p.name, language)}</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">
                            Flagged for Review
                          </span>
                        </div>
                        <div className="text-stone-500 mt-1">
                          {p.farmName} · ₹{p.price} / {translateUnitName(p.unit, language)}
                        </div>
                        {p.moderationReason && (
                          <div className="text-rose-700 mt-1 text-[11px] font-medium">
                            Reason: {p.moderationReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moderateListing(p.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded font-semibold hover:bg-emerald-900"
                        >
                          {t('approveKeepBtn')}
                        </button>
                        <button
                          onClick={() => moderateListing(p.id, 'remove', 'Removed permanently by admin')}
                          className="px-3 py-1.5 bg-rose-700 text-white rounded font-semibold hover:bg-rose-800"
                        >
                          {t('removePermanentlyBtn')}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flagging Modal */}
      {flaggingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 max-w-md w-full p-6 text-xs space-y-4">
            <div className="font-bold text-stone-900 text-sm">Flag Listing for Review</div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Reason for Flag:</label>
              <textarea
                value={flagReason}
                onChange={e => setFlagReason(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFlaggingProductId(null)}
                className="px-3 py-1.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyFlag(flaggingProductId)}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
              >
                Apply Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
