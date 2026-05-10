package com.siuuuuu.logly_backend.global.util;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * 파일을 업로드하고 접근 가능한 URL을 반환합니다.
     *
     * @param file      업로드할 파일
     * @param directory 저장 경로 (예: "records/1", "trips/2")
     * @return 업로드된 파일의 URL
     */
    String upload(MultipartFile file, String directory);

    /**
     * 파일을 삭제합니다.
     *
     * @param fileUrl 삭제할 파일의 URL
     */
    void delete(String fileUrl);
}
