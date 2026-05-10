package com.siuuuuu.logly_backend.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${storage.local.server-url:http://localhost:8080}")
    private String serverUrl;

    @Override
    public String upload(MultipartFile file, String directory) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().resolve(directory);
            Files.createDirectories(dirPath);

            Path filePath = dirPath.resolve(fileName);
            file.transferTo(filePath.toAbsolutePath().toFile());

            String relativePath = directory + "/" + fileName;
            log.info("[LocalStorage] 파일 저장: {}", filePath.toAbsolutePath());
            return serverUrl + "/files/" + relativePath;
        } catch (IOException e) {
            throw new RuntimeException("로컬 파일 저장 실패: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            String relativePath = fileUrl.substring(fileUrl.indexOf("/files/") + 7);
            Path filePath = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(filePath);
            log.info("[LocalStorage] 파일 삭제: {}", filePath.toAbsolutePath());
        } catch (IOException e) {
            log.warn("[LocalStorage] 파일 삭제 실패: {}", e.getMessage());
        }
    }

    public Path getUploadRootPath() {
        return Paths.get(uploadDir).toAbsolutePath();
    }
}
