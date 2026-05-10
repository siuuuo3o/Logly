package com.siuuuuu.logly_backend.global.config;

import com.siuuuuu.logly_backend.global.util.LocalFileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/files")
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalFilesController {

    private final LocalFileStorageService localFileStorageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) throws MalformedURLException {
        String relativePath = request.getRequestURI().substring("/files/".length());
        Path rootPath = localFileStorageService.getUploadRootPath();
        Path filePath = rootPath.resolve(relativePath).normalize();

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        String fileName = filePath.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (fileName.endsWith(".png")) contentType = "image/png";
        else if (fileName.endsWith(".gif")) contentType = "image/gif";
        else if (fileName.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }
}
