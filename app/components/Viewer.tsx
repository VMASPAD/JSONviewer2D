// @ts-nocheck
"use client"
import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, ChevronDown, Type, Hash, Calendar, Binary } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TypeIcon = ({ type }) => {
  switch (type) {
    case 'string':
      return <Type className="w-4 h-4 text-green-500" />;
    case 'number':
      return <Hash className="w-4 h-4 text-blue-500" />;
    case 'boolean':
      return <Binary className="w-4 h-4 text-purple-500" />;
    case 'date':
      return <Calendar className="w-4 h-4 text-yellow-500" />;
    default:
      return null;
  }
};

const JsonNode = ({ data, isRoot = false }) => {
  const [isExpanded, setIsExpanded] = useState(isRoot);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (!isObject) {
    const type = typeof data;
    return (
      <div className="flex items-center">
        <TypeIcon type={type} />
        <p className={`ml-1 ${type === 'string' ? 'text-green-600' : 'text-blue-600'}`}>
          {JSON.stringify(data)}
        </p>
      </div>
    );
  }

  const entries = Object.entries(data);

  return (
    <div>
      <div onClick={toggleExpand} className="cursor-pointer flex items-center">
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <p className="ml-1 font-bold">{isArray ? '[]' : '{}'}</p>
        <p className="ml-2 text-gray-500">{entries.length} {entries.length === 1 ? 'item' : 'items'}</p>
      </div>
      {isExpanded && (
        <div className="ml-4">
          {entries.map(([key, value], index) => (
            <div key={key} className="my-1">
              <p className="text-red-500">{JSON.stringify(key)}: </p>
              <JsonNode data={value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Viewer = () => {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('dataJSON');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setJsonData(parsedData);
      } else {
        setError('No se encontraron datos JSON en localStorage');
      }
    } catch (err) {
      setError('Error al parsear los datos JSON: ' + err.message);
    }
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-[80vh]">
      {jsonData && <JsonNode data={jsonData} isRoot={true} />}
    </div>
  );
};

export default Viewer;