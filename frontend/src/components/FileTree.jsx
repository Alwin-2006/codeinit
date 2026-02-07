
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

export default function FileTree({ tree, onFileSelect, selectedFile }) {
    const [expanded, setExpanded] = useState(new Set(['root']));

    const toggleExpand = (path) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const renderNode = (node, depth = 0) => {
        if (!node) return null;

        const isExpanded = expanded.has(node.path || 'root');
        const isSelected = selectedFile === node.path;
        const isDirectory = node.type === 'directory';

        if (node.name === 'root') {
            return (
                <div className="space-y-1">
                    {node.children?.map((child, index) => (
                        <div key={index}>{renderNode(child, 0)}</div>
                    ))}
                </div>
            );
        }

        return (
            <div>
                <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group
            ${isSelected ? 'bg-primary-600/20 text-primary-300' : 'hover:bg-white/5'}`}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                    onClick={() => {
                        if (isDirectory) {
                            toggleExpand(node.path);
                        } else {
                            onFileSelect(node.path);
                        }
                    }}
                >
                    {isDirectory && (
                        <span className="text-gray-400 transition-transform" style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}>
                            <ChevronRight size={16} />
                        </span>
                    )}
                    {!isDirectory && <span className="w-4" />}

                    <span className="text-gray-400">
                        {isDirectory ? (
                            isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
                        ) : (
                            <File size={16} />
                        )}
                    </span>

                    <span className={`text-sm font-mono truncate ${isDirectory ? 'font-semibold text-gray-200' : 'text-gray-300'
                        }`}>
                        {node.name}
                    </span>
                </div>

                {isDirectory && isExpanded && node.children && (
                    <div className="space-y-1">
                        {node.children.map((child, index) => (
                            <div key={index}>{renderNode(child, depth + 1)}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass rounded-xl p-4 h-full overflow-y-auto scrollbar-thin">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-200">File Explorer</h3>
                <p className="text-xs text-gray-500 mt-1">
                    {tree?.children?.length || 0} items
                </p>
            </div>

            {tree ? (
                <div className="space-y-1">
                    {renderNode(tree)}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>No files to display</p>
                </div>
            )}
        </div>
    );
}