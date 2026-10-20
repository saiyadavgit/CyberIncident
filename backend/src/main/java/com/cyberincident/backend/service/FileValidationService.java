package com.cyberincident.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/png",
            "image/jpeg",
            "application/pdf",
            "text/plain",
            "text/csv"
    );

    public void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size cannot exceed 10 MB");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {

            throw new RuntimeException(
                    "Unsupported file type. Allowed types: PNG, JPEG, PDF, TXT, CSV"
            );
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new RuntimeException("Invalid file name");
        }

        String lowerCaseFileName = fileName.toLowerCase();

        if (lowerCaseFileName.endsWith(".exe")
                || lowerCaseFileName.endsWith(".bat")
                || lowerCaseFileName.endsWith(".cmd")
                || lowerCaseFileName.endsWith(".sh")
                || lowerCaseFileName.endsWith(".js")
                || lowerCaseFileName.endsWith(".jar")) {

            throw new RuntimeException(
                    "Executable files are not allowed"
            );
        }

        validateFileSignature(file, contentType);
    }

    private void validateFileSignature(
            MultipartFile file,
            String contentType) {

        try {

            byte[] bytes = file.getBytes();

            switch (contentType.toLowerCase()) {

                case "image/png":
                    validatePng(bytes);
                    break;

                case "image/jpeg":
                    validateJpeg(bytes);
                    break;

                case "application/pdf":
                    validatePdf(bytes);
                    break;

                case "text/plain":
                case "text/csv":
                    // Text files do not have a fixed magic-byte signature.
                    break;

                default:
                    throw new RuntimeException("Unsupported file type");
            }

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Could not inspect uploaded file"
            );
        }
    }

    private void validatePng(byte[] bytes) {

        if (bytes.length < 8
                || bytes[0] != (byte) 0x89
                || bytes[1] != 0x50
                || bytes[2] != 0x4E
                || bytes[3] != 0x47
                || bytes[4] != 0x0D
                || bytes[5] != 0x0A
                || bytes[6] != 0x1A
                || bytes[7] != 0x0A) {

            throw new RuntimeException(
                    "File content does not match PNG format"
            );
        }
    }

    private void validateJpeg(byte[] bytes) {

        if (bytes.length < 3
                || bytes[0] != (byte) 0xFF
                || bytes[1] != (byte) 0xD8
                || bytes[2] != (byte) 0xFF) {

            throw new RuntimeException(
                    "File content does not match JPEG format"
            );
        }
    }

    private void validatePdf(byte[] bytes) {

        if (bytes.length < 5
                || bytes[0] != 0x25
                || bytes[1] != 0x50
                || bytes[2] != 0x44
                || bytes[3] != 0x46
                || bytes[4] != 0x2D) {

            throw new RuntimeException(
                    "File content does not match PDF format"
            );
        }
    }
}