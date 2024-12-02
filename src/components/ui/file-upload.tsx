import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { X } from "lucide-react";
import { toast } from "sonner";

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onChange) {
      onChange(files);
    }
  }, [files, onChange]);

  const handleFileChange = (newFiles: File[]) => {
    for (const file of newFiles) {
      if (file.size / (1024 * 1024) >= 50) {
        toast.error("File size must be less than 50MB!");
        newFiles.splice(newFiles.indexOf(file), 1);
      }
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("handleClick");
    fileInputRef.current?.click();
  };

  const handleDelete = (event: React.MouseEvent, file: File) => {
    event.stopPropagation();
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
  };

  function UploadButton() {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "group mx-auto flex h-16 w-full cursor-pointer items-center justify-center rounded-md bg-secondary transition-colors hover:bg-secondary/70 group-hover/file:shadow-2xl",
          "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
        )}
      >
        <IconUpload className="h-4 w-4 text-neutral-600 transition-all group-hover:scale-150 dark:text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div className="group/file rounded-lg">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        <div className="flex flex-col gap-2">
          {files.length > 0 &&
            files.map((file, idx) => (
              <motion.div
                key={"file" + idx}
                layoutId={"file-upload-" + idx}
                className={cn(
                  "relative mx-auto flex w-full flex-col items-start justify-start rounded-md border bg-white p-4 dark:bg-neutral-900",
                  "shadow-sm",
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <div className="flex w-full items-center justify-between gap-4">
                    <img
                      src={URL.createObjectURL(file)}
                      className="h-16 rounded-md"
                    />
                    <div className="flex w-full items-center justify-between gap-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="truncate text-base text-neutral-700 dark:text-neutral-300"
                      >
                        {file.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="w-fit flex-shrink-0 rounded-lg px-2 py-1 text-sm text-neutral-600 shadow-input dark:bg-neutral-800 dark:text-white"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    </div>
                  </div>
                  <div
                    onClick={(e) => handleDelete(e, file)}
                    className="cursor-pointer rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X size={16} />
                  </div>
                </div>
              </motion.div>
            ))}

          <UploadButton />
        </div>
      </motion.div>
    </div>
  );
};
