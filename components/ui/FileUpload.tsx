"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { UploadIcon, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadProps {
    onUpload: (files: File[]) => Promise<void>
    accept?: Record<string, string[]>
    maxSize?: number
    multiple?: boolean
    className?: string
}

export function Upload({
    onUpload,
    accept = { "image/*": [] },
    maxSize = 5 * 1024 * 1024,
    multiple = false,
    className,
}: UploadProps) {
    const [files, setFiles] = useState<(File & { preview?: string })[]>([])
    const [uploading, setUploading] = useState(false)

    const filesRef = useRef(files)
    useEffect(() => { filesRef.current = files }, [files])
    useEffect(() => () => { filesRef.current.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview) }) }, [])

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            filesRef.current.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview) })
            setFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );


        },
        []
    );


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple,
        disabled: uploading,
    })

    const removeFile = (index: number) => {
        if (files[index]?.preview) URL.revokeObjectURL(files[index].preview!)
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleUpload = async () => {
        if (files.length === 0) return
        setUploading(true)
        try {
            await onUpload(files)
            files.forEach(file => { if (file.preview) URL.revokeObjectURL(file.preview) })
            setFiles([])
        } catch (error) {
            console.error("Upload failed:", error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                )}
            >
                <input {...getInputProps()} />
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                    <p>Drop the files here...</p>
                ) : (
                    <div>
                        <p className="text-lg font-medium">Drop files here or click to browse</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Max file size: {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            {file.type.startsWith("image/") ? (
                                <img
                                    src={file.preview || "/placeholder.svg"}
                                    alt={file.name}
                                    className="h-24 w-24 shrink-0 object-contain rounded"
                                />
                            ) : (
                                <File className="h-12 w-12 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round(file.size / 1024)} KB
                                </p>
                            </div>
                            <Button type="button" aria-label="Remove selected file" disabled={uploading} variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" onClick={handleUpload} disabled={uploading} className="w-full">
                        {uploading ? "Uploading..." : "Upload Files"}
                    </Button>
                </div>
            )}
        </div>
    )
}

export { Upload as FileUpload }
