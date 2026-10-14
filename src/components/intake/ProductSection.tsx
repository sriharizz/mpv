import React, { useState } from 'react';
import { useCases, MEDICAL_SOURCE_DOCUMENTS, FAQ_LIST } from '../../context/CaseContext';
import { useSimulation } from '../../context/SimulationContext';
import { ProductInfo } from '../../types/onepv';
import { Package, Search, Edit, FileText, Download, HelpCircle, X, ExternalLink } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog';

const AVAILABLE_PRODUCTS = [
  {
    productName: 'Clinevo-Vax 500mg',
    genericName: 'Paracetamol',
    formulationCode: 'TAB - Film-Coated Tablet',
  },
  {
    productName: 'CardioSafe 10mg',
    genericName: 'Amlodipine Besylate',
    formulationCode: 'CAP - Oral Capsule',
  },
  {
    productName: 'NeuroCalm 25mg',
    genericName: 'Pregabalin',
    formulationCode: 'SOL - Oral Solution',
  },
];

export const ProductSection: React.FC = () => {
  const { currentCase, updateProduct } = useCases();
  const { mode } = useSimulation();

  const [formData, setFormData] = useState<ProductInfo>(currentCase.product);
  const [isSaved, setIsSaved] = useState<boolean>(currentCase.product.saved);
  const [hasSavedBefore, setHasSavedBefore] = useState<boolean>(currentCase.product.saved);

  // Modals state
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(0);

  const [isEditDrugInfoOpen, setIsEditDrugInfoOpen] = useState(false);
  const [tempDrugInfo, setTempDrugInfo] = useState('');

  const [isMedicalInfoOpen, setIsMedicalInfoOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [faqSelectedProduct, setFaqSelectedProduct] = useState('Clinevo-Vax 500mg');
  const [faqSearched, setFaqSearched] = useState(true);
  const [selectedFAQAnswer, setSelectedFAQAnswer] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleOpenProductSearch = () => {
    setProductSearchQuery('');
    setSelectedProductIdx(0);
    setIsProductSearchOpen(true);
  };

  const handleSelectProduct = () => {
    const chosen = filteredProducts[selectedProductIdx] || AVAILABLE_PRODUCTS[0];

    // Check Defect B in FAIL simulation mode:
    // "Defect B (Auto-Population Failure): Selecting a Product from the Product Search modal fails to auto-populate Generic Name and Formulation Code (leaves them blank)."
    if (mode === 'FAIL') {
      setFormData((prev) => ({
        ...prev,
        productName: chosen.productName,
        genericName: '',
        formulationCode: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        productName: chosen.productName,
        genericName: chosen.genericName,
        formulationCode: chosen.formulationCode,
      }));
    }

    setIsProductSearchOpen(false);
  };

  const handleSaveProduct = () => {
    updateProduct(formData);
    const wasSaved = hasSavedBefore;
    setHasSavedBefore(true);
    setIsSaved(true);

    setModalState({
      isOpen: true,
      title: 'Product Confirmation',
      message: wasSaved
        ? 'Product data updated successfully.'
        : 'Product data saved successfully.',
    });
  };

  const handleOpenEditDrugInfo = () => {
    setTempDrugInfo(formData.additionalDrugInfo || '');
    setIsEditDrugInfoOpen(true);
  };

  const handleSaveDrugInfo = () => {
    setFormData((prev) => ({ ...prev, additionalDrugInfo: tempDrugInfo }));
    setIsEditDrugInfoOpen(false);

    setModalState({
      isOpen: true,
      title: 'Confirmation',
      message: 'Additional Drug Information updated successfully.',
    });
  };

  // Real file download for OQ Scenario 29
  const handleDownloadDoc = (doc: (typeof MEDICAL_SOURCE_DOCUMENTS)[0]) => {
    const textContent = `==========================================================\nCLINEVO PHARMACOVIGILANCE SAFETY DATASHEET\n==========================================================\nDocument ID: ${doc.id}\nTitle: ${doc.title}\nProduct: ${doc.productName}\nClassification: Regulatory & Clinical Safety Monograph\nTimestamp: ${new Date().toISOString()}\n\n1. CLINICAL PHARMACOLOGY\nThis medicinal product is indicated for the treatment and management of designated indications adhering to ICH-E2B(R3) guidelines.\n\n2. ADVERSE REACTIONS REPORTING\nAdverse event reporting complies with EMA and FDA Post-Marketing Safety reporting directives. Any unexpected adverse drug reactions must be expedited to the regulatory authorities within 15 calendar days.\n\nValidated Mock Source Document for Clinevo OnePV Intake System 1.1\n==========================================================`;

    const blob = new Blob([textContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setModalState({
      isOpen: true,
      title: 'Download Status',
      message: 'Source document downloaded successfully.',
    });
  };

  const filteredProducts = AVAILABLE_PRODUCTS.filter((p) =>
    p.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.genericName.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const displayedFAQs = FAQ_LIST.filter(
    (f) => !faqSearched || f.productName.toLowerCase() === faqSelectedProduct.toLowerCase()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Product Information</h3>
        </div>

        <div className="flex items-center space-x-3">
          {/* FAQ Template Button (OQ Scenario 30) */}
          <button
            type="button"
            onClick={() => {
              setFaqSelectedProduct(formData.productName || 'Clinevo-Vax 500mg');
              setFaqSearched(true);
              setIsFAQModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100 rounded-md transition-colors flex items-center space-x-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ Template</span>
          </button>

          {/* Product Information Hyperlink (OQ Scenarios 27, 28, 29) */}
          {isSaved && (
            <button
              type="button"
              onClick={() => setIsMedicalInfoOpen(true)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 underline underline-offset-2 flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Product Information</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Product Name with Search Icon */}
        <div className="space-y-1">
          <label htmlFor="productName" className="block font-medium text-slate-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="productName"
              value={formData.productName}
              onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
              placeholder="Enter product name"
              className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Search Product"
              data-testid="product-search-icon"
              onClick={handleOpenProductSearch}
              className="absolute right-2 text-slate-400 hover:text-brand-600 p-1"
              title="Search Product"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Generic Name (Auto-populated) */}
        <div className="space-y-1">
          <label htmlFor="genericName" className="block font-medium text-slate-700">
            Generic Name
          </label>
          <input
            type="text"
            id="genericName"
            value={formData.genericName}
            onChange={(e) => setFormData((prev) => ({ ...prev, genericName: e.target.value }))}
            placeholder="Generic name"
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Formulation Code (Auto-populated) */}
        <div className="space-y-1">
          <label htmlFor="formulationCode" className="block font-medium text-slate-700">
            Formulation Code
          </label>
          <input
            type="text"
            id="formulationCode"
            value={formData.formulationCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, formulationCode: e.target.value }))}
            placeholder="Formulation code"
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Additional Drug Information with Edit Icon (OQ Scenario 31) */}
        <div className="space-y-1 md:col-span-2 lg:col-span-3">
          <label htmlFor="additionalDrugInfo" className="block font-medium text-slate-700">
            Additional Drug Information
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="additionalDrugInfo"
              value={formData.additionalDrugInfo}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalDrugInfo: e.target.value }))}
              placeholder="Enter Additional Drug Information"
              className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Edit Additional Drug Information"
              data-testid="edit-additional-drug-icon"
              onClick={handleOpenEditDrugInfo}
              className="absolute right-2 text-slate-400 hover:text-brand-600 p-1"
              title="Edit in modal"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          data-testid="save-product-btn"
          onClick={handleSaveProduct}
          className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors"
        >
          Save
        </button>
      </div>

      {/* PRODUCT SEARCH MODAL */}
      {isProductSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">Product Search</h3>
              <button
                type="button"
                onClick={() => setIsProductSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
                >
                  Search
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center">Select</th>
                      <th className="px-4 py-2">Product Name</th>
                      <th className="px-4 py-2">Generic Name</th>
                      <th className="px-4 py-2">Formulation Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p, idx) => (
                      <tr
                        key={p.productName}
                        onClick={() => setSelectedProductIdx(idx)}
                        className={`cursor-pointer transition-colors ${
                          selectedProductIdx === idx ? 'bg-brand-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="radio"
                            name="productSelectionRadio"
                            checked={selectedProductIdx === idx}
                            onChange={() => setSelectedProductIdx(idx)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{p.productName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p.genericName}</td>
                        <td className="px-4 py-2.5 text-slate-600">{p.formulationCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsProductSearchOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelectProduct}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ADDITIONAL DRUG INFORMATION MODAL (OQ Scenario 31) */}
      {isEditDrugInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">Edit Additional Drug Information</h3>
              <button
                type="button"
                onClick={() => setIsEditDrugInfoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-2 text-xs">
              <label htmlFor="tempDrugInfoText" className="block font-medium text-slate-700">
                Additional Drug Information
              </label>
              <textarea
                id="tempDrugInfoText"
                rows={4}
                value={tempDrugInfo}
                onChange={(e) => setTempDrugInfo(e.target.value)}
                placeholder="Enter additional details"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditDrugInfoOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDrugInfo}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MEDICAL INFORMATION MODAL (OQ Scenarios 27, 28, 29) */}
      {isMedicalInfoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">Product Medical Information</h3>
              <button
                type="button"
                onClick={() => setIsMedicalInfoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">Available medical information source documents for this product:</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 w-1/4">Document ID</th>
                      <th className="px-4 py-2.5 w-1/2">Document Title</th>
                      <th className="px-4 py-2.5 w-1/8 text-center">View</th>
                      <th className="px-4 py-2.5 w-1/8 text-center">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MEDICAL_SOURCE_DOCUMENTS.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5 font-mono text-slate-700">{doc.id}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{doc.title}</td>
                        <td className="px-4 py-2.5 text-center">
                          {/* OQ Scenario 28: View link target="_blank" */}
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-brand-600 hover:text-brand-800 underline font-semibold"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {/* OQ Scenario 29: Download icon */}
                          <button
                            type="button"
                            aria-label="Download Source Document"
                            data-testid="download-product-doc-icon"
                            onClick={() => handleDownloadDoc(doc)}
                            className="p-1 text-brand-600 hover:text-brand-800 rounded hover:bg-brand-50 transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsMedicalInfoOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ TEMPLATE POP-UP MODAL (OQ Scenario 30) */}
      {isFAQModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">FAQ Template</h3>
              <button
                type="button"
                onClick={() => setIsFAQModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex-1 space-y-1">
                  <label htmlFor="faqProductSelect" className="block font-medium text-slate-700">
                    Product
                  </label>
                  <select
                    id="faqProductSelect"
                    value={faqSelectedProduct}
                    onChange={(e) => setFaqSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Clinevo-Vax 500mg">Clinevo-Vax 500mg</option>
                    <option value="CardioSafe 10mg">CardioSafe 10mg</option>
                    <option value="NeuroCalm 25mg">NeuroCalm 25mg</option>
                  </select>
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => setFaqSearched(true)}
                    className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 w-24">FAQ ID</th>
                      <th className="px-4 py-2">Question</th>
                      <th className="px-4 py-2 w-24 text-center">FAQ Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedFAQs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono text-slate-700">{faq.id}</td>
                        <td className="px-4 py-2.5 text-slate-800">{faq.question}</td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedFAQAnswer(faq.answer)}
                            className="text-brand-600 hover:text-brand-800 underline font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsFAQModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NESTED FAQ ANSWER POP-UP (OQ Scenario 30) */}
      {selectedFAQAnswer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">FAQ Answer</h3>
              <button
                type="button"
                onClick={() => setSelectedFAQAnswer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 leading-relaxed">
              <p>{selectedFAQAnswer}</p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedFAQAnswer(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      <ModalDialog
        isOpen={modalState.isOpen}
        type="confirm"
        title={modalState.title}
        message={modalState.message}
        confirmLabel="OK"
        onConfirm={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
