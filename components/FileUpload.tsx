import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, className = '' }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const allFiles = [...files, ...newFiles];
      setFiles(allFiles);
      onFilesChange(allFiles);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]); // Clean up memory
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const newFiles = Array.from(event.dataTransfer.files);
        const allFiles = [...files, ...newFiles];
        setFiles(allFiles);
        onFilesChange(allFiles);

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
        
        event.dataTransfer.clearData();
    }
  }, [files, onFilesChange, previews]);

  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  return (
    <div className={className}>
      <label className="mb-2 font-medium text-blue-900/90 block">Fotos do Imóvel</label>
      <label 
        htmlFor="file-upload" 
        className="flex justify-center w-full h-32 px-4 transition bg-slate-50 border-2 border-slate-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-orange-400 focus:outline-none"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <span className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium text-slate-600">
            Arraste e solte os arquivos aqui, ou{' '}
            <span className="text-orange-600 underline">clique para selecionar</span>
          </span>
        </span>
        <input id="file-upload" name="file-upload" type="file" multiple accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileChange} />
      </label>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group">
              <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg shadow-md" />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover imagem"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};