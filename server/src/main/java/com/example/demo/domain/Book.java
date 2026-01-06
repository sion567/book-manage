package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "t_book")
public class Book extends BaseEntity {

    @Id
    @GeneratedValue
    private Integer id;
    private String title;
    private String author;
    private String isbn;
    private BigDecimal price;
    @Column(name = "publication_date")
    private LocalDate publicationDate;

    @PrePersist
    @PreUpdate
    public void pricePrecisionConvertion() {
        if (this.price != null) {
            this.price = this.price.setScale(2, RoundingMode.HALF_UP); // 向远离零的方向四舍五入
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
}
