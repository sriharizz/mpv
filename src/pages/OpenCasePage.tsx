import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCases } from '../context/CaseContext';
import { FolderSearch, Search, ArrowRight, Filter } from 'lucide-react';

export const OpenCasePage: React.FC = () => {
  const { cases } = useCases();

  const [classificationFilter, setClassificationFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(true);

  // Filter cases based on selected filters
  const filteredCases = cases.filter((c) => {
    if (!c.caseNumber) return false;
    const matchClassification = !classificationFilter || c.generalInfo.caseClassificationCode === classificationFilter;
    const matchSource = !sourceFilter || c.generalInfo.caseIntakeSourceCode === sourceFilter;
    return matchClassification && matchSource;
  });

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center space-x-2">
          <FolderSearch className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Case Intake Search (Open Case)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Search, view, and open registered cases in Case Processing
        </p>
      </div>

      {/* Case Intake Search Filters (OQ Scenario 41, PQ 18, OQ Test Set #2 Scenario 3) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Search Criteria</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Case Classification Code */}
          <div className="space-y-1">
            <label htmlFor="searchClassificationCode" className="block font-medium text-slate-700">
              Case Classification Code
            </label>
            <select
              id="searchClassificationCode"
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Classification</option>
              <option value="Adverse Event">Adverse Event</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          {/* Case Intake Source Code */}
          <div className="space-y-1">
            <label htmlFor="searchIntakeSourceCode" className="block font-medium text-slate-700">
              Case Intake Source Code
            </label>
            <select
              id="searchIntakeSourceCode"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Intake Source</option>
              <option value="Other">Other</option>
              <option value="Spontaneous">Spontaneous</option>
              <option value="Clinical Trial">Clinical Trial</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full md:w-auto px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Search Details Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Case Search Details ({filteredCases.length} cases found)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Case Classification Code</th>
                <th className="px-4 py-3">Case Intake Source Code</th>
                <th className="px-4 py-3">Patient Initials</th>
                <th className="px-4 py-3">Reported Term</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    No cases match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.caseNumber} className="hover:bg-slate-50/80 transition-colors">
                    {/* Clickable Hyperlink for Case Number */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/intake/case-processing/${c.caseNumber}`}
                        className="font-mono font-bold text-brand-600 hover:text-brand-800 underline underline-offset-2 flex items-center space-x-1"
                      >
                        <span>{c.caseNumber}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.generalInfo.caseClassificationCode || 'Adverse Event'}</td>
                    <td className="px-4 py-3 text-slate-700">{c.generalInfo.caseIntakeSourceCode || 'Other'}</td>
                    <td className="px-4 py-3 text-slate-700">{c.patient.initials || 'JM'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.event.reportedTerm || 'Fever'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/intake/case-processing/${c.caseNumber}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded border border-brand-200 transition-colors"
                      >
                        <span>Open Case</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
