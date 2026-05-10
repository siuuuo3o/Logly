package com.siuuuuu.logly_backend.domain.category.mapper;

import com.siuuuuu.logly_backend.domain.category.dto.CategoryResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryMapper {

    List<CategoryResponse> findAllByUserId(@Param("userId") Long userId);

    Optional<CategoryResponse> findById(@Param("id") Long id);
}
