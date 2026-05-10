-- =====================================================================
-- V2: 카테고리 도메인 추가 + place.category → record.category_id 이전
-- 적용 전 백업 권장. 한 번에 트랜잭션으로 실행하세요.
-- =====================================================================

START TRANSACTION;

-- 1. category 테이블 생성
CREATE TABLE category (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    name        VARCHAR(30)  NOT NULL,
    color       VARCHAR(7)   NOT NULL,
    icon        VARCHAR(10),
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    CONSTRAINT uk_category_user_name UNIQUE (user_id, name),
    CONSTRAINT fk_category_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. 기존 모든 유저에게 기본 카테고리 4종 시드 (UNIQUE 충돌 시 무시)
INSERT IGNORE INTO category (user_id, name, color, icon, is_default, created_at, updated_at)
SELECT u.id, '카페', '#B07A5C', '☕', TRUE, NOW(6), NOW(6) FROM users u;

INSERT IGNORE INTO category (user_id, name, color, icon, is_default, created_at, updated_at)
SELECT u.id, '음식점', '#E07A5F', '🍽️', TRUE, NOW(6), NOW(6) FROM users u;

INSERT IGNORE INTO category (user_id, name, color, icon, is_default, created_at, updated_at)
SELECT u.id, '자연', '#6BAA5E', '🌿', TRUE, NOW(6), NOW(6) FROM users u;

INSERT IGNORE INTO category (user_id, name, color, icon, is_default, created_at, updated_at)
SELECT u.id, '기타', '#888888', '📍', TRUE, NOW(6), NOW(6) FROM users u;

-- 3. record 테이블에 category_id 추가
ALTER TABLE record ADD COLUMN category_id BIGINT;
ALTER TABLE record ADD CONSTRAINT fk_record_category
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL;

-- 4. 기존 record의 place.category enum을 user의 매칭 default 카테고리로 매핑
UPDATE record r
JOIN place p     ON r.place_id = p.id
JOIN category c  ON c.user_id = r.user_id
                AND c.is_default = TRUE
                AND c.name = CASE p.category
                    WHEN 'CAFE' THEN '카페'
                    WHEN 'RESTAURANT' THEN '음식점'
                    WHEN 'NATURE' THEN '자연'
                    ELSE '기타'
                END
SET r.category_id = c.id
WHERE r.category_id IS NULL;

-- place 가 없는 record 는 '기타' 로 연결
UPDATE record r
JOIN category c ON c.user_id = r.user_id AND c.is_default = TRUE AND c.name = '기타'
SET r.category_id = c.id
WHERE r.category_id IS NULL;

-- 5. place.category 컬럼 제거 (Place 엔티티에서 제거됨)
ALTER TABLE place DROP COLUMN category;

COMMIT;
