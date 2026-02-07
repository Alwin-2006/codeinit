
import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

export default function FileTree({ tree, onFileSelect, selectedFile, changedFiles = new Set() }) {
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

    const isChanged = (path) => {
        if (!changedFiles) return false;
        return changedFiles.has(path);
    };

    const hasChangedChild = (nodePath) => {
        if (!changedFiles || changedFiles.size === 0) return false;
        if (nodePath === 'root') return true; // root always conceptually contains everything

        for (let changedPath of changedFiles) {
            if (changedPath.startsWith(nodePath + '/')) {
                return true;
            }
        }
        return false;
    };

    const renderNode = (node, depth = 0) => {
        if (!node) return null;

        const isExpanded = expanded.has(node.path || 'root');
        const isSelected = selectedFile === node.path;
        const isDirectory = node.type === 'directory';

        const nodePath = node.path || (node.name === 'root' ? 'root' : '');
        const nodeIsChanged = isChanged(nodePath);
        const nodeHasChanges = isDirectory && hasChangedChild(nodePath);

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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all group
                        ${isSelected ? 'bg-primary-600/20 text-primary-300' : 'hover:bg-white/5'}`}
                    style={{ paddingLeft: `${depth * 16 + 12}px` }}
                    onClick={() => {
                        if (isDirectory) {
                            toggleExpand(nodePath);
                        } else {
                            onFileSelect(nodePath);
                        }
                    }}
                >
                    {isDirectory && (
                        <span className="text-gray-400 transition-transform" style={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                        }}>
                            <ChevronRight size={14} />
                        </span>
                    )}
                    {!isDirectory && <span className="w-3.5" />}

                    <span className={`${nodeIsChanged || nodeHasChanges ? 'text-[#f34f29]' : 'text-gray-400'}`}>
                        {isDirectory ? (
                            isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />
                        ) : (
                            <File size={14} />
                        )}
                    </span>

                    <span className={`text-sm font-mono truncate ${isDirectory ? 'font-semibold' : ''
                        } ${nodeIsChanged || nodeHasChanges ? 'text-[#f34f29] font-bold' : 'text-gray-300'
                        }`}>
                        {node.name}
                    </span>
                </div>

                {isDirectory && isExpanded && node.children && (
                    <div className="space-y-1 mt-0.5">
                        {node.children.map((child, index) => (
                            <div key={index}>{renderNode(child, depth + 1)}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass rounded-xl flex flex-col h-[300px] md:h-full min-h-0 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Folder size={14} className="text-primary-400" />
                    File Explorer
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                    {tree?.children?.length || 0} items total
                </p>
            </div>

            <div className="flex-1 overflow-auto p-2 scrollbar-thin">
                {tree ? (
                    <div className="space-y-0.5">
                        {renderNode(tree)}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p className="text-xs italic">No files to display</p>
                    </div>
                )}
            </div>
        </div>
    );
}