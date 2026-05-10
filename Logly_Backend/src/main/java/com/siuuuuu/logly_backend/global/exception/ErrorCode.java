package com.siuuuuu.logly_backend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT("잘못된 입력값입니다.", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND("요청한 리소스를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED("인증이 필요합니다.", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    INTERNAL_SERVER_ERROR("서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // Auth
    EMAIL_ALREADY_EXISTS("이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("유효하지 않은 토큰입니다.", HttpStatus.UNAUTHORIZED),
    EXPIRED_TOKEN("만료된 토큰입니다.", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // Record
    RECORD_NOT_FOUND("기록을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    RECORD_ACCESS_DENIED("해당 기록에 접근 권한이 없습니다.", HttpStatus.FORBIDDEN),

    // Trip
    TRIP_NOT_FOUND("여행을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),

    // Share
    SHARE_GROUP_NOT_FOUND("공유 그룹을 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    INVALID_INVITE_CODE("유효하지 않은 초대 코드입니다.", HttpStatus.BAD_REQUEST),
    ALREADY_IN_GROUP("이미 그룹에 참여 중입니다.", HttpStatus.CONFLICT),

    // Category
    CATEGORY_NOT_FOUND("카테고리를 찾을 수 없습니다.", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_DUPLICATE("이미 같은 이름의 카테고리가 있습니다.", HttpStatus.CONFLICT),
    CATEGORY_DEFAULT_CANNOT_DELETE("기본 카테고리는 삭제할 수 없습니다.", HttpStatus.BAD_REQUEST),

    // S3
    S3_UPLOAD_FAILED("파일 업로드에 실패했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus status;
}
