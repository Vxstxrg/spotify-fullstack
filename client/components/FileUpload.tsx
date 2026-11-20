import React, { useRef } from 'react'

interface FileUploadProps {
	setFile: (file: File | null) => void;
	accept?: string;
	children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ setFile, accept, children }) => {
	const ref = useRef<HTMLInputElement>(null);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		 
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		} else {
			setFile(null);
		}
	}

	return (
		<div onClick={() => ref.current?.click()}>
			<input type="file" accept={accept || "image/*,audio/*"}
				style={{ display: 'none' }}
				ref={ref}

				onChange={onChange}
			/>
			{children}
		</div>
	);
}
export default FileUpload;