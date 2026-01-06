package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor  // Jackson实例化对象需要这个
@AllArgsConstructor // Builder 模式需要这个
public class BookRequest {
    private Integer id;
    private String title;
    private String author;
    private String isbn;
    @NotNull(message = "价格不能为空")
    @DecimalMin(value = "0.0", inclusive = false, message = "价格必须大于0")
    @Digits(integer = 7, fraction = 2, message = "价格格式不正确（最多7位整数和2位小数）")
    private BigDecimal price;
    @NotNull(message = "发布日期不能为空")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate publicationDate;
    private Integer categoryId;
}