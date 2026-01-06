package com.example.demo;

import com.example.demo.domain.Book;
import com.example.demo.domain.Category;
import com.example.demo.domain.User;
import com.example.demo.dto.BookRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.service.AuthenticationService;
import com.example.demo.service.BookService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static com.example.demo.domain.Role.*;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(AuthenticationService service, BookService bookService, CategoryRepository categoryRepository) {
		return args -> {
			var admin = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("Admin")
					.email("admin@mail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Admin token: " + service.register(admin).getAccessToken());

			var manager = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("Admin")
					.email("manager@mail.com")
					.password("password")
					.role(MANAGER)
					.build();
			System.out.println("Manager token: " + service.register(manager).getAccessToken());

			User adminUser = User.builder().id(1).email(admin.getEmail()).role(ADMIN).build();
			UsernamePasswordAuthenticationToken adminAuth = new UsernamePasswordAuthenticationToken(
					adminUser,
					null,
					adminUser.getAuthorities()
			);
			SecurityContextHolder.getContext().setAuthentication(adminAuth);

			var category1 = Category.builder().name("未知").build();
			var category2 = Category.builder().name("技术").description("计算机科学、编程与架构").build();
			var category3 = Category.builder().name("文学").description("古典与现代文学").build();
			var category4 = Category.builder().name("商务").description("经济、管理与创业").build();
			var category5 = Category.builder().name("艺术").description("摄影、设计与音乐").build();
			var category6 = Category.builder().name("生活").description("烹饪、旅行与健康").build();
			categoryRepository.saveAll(List.of(category1, category2, category3, category4, category5, category6));

			Category category = new Category();
			category.setName("未知");
			Example<Category> ex = Example.of(category);
			category = categoryRepository.findOne(ex).get();

			var book1 = BookRequest.builder()
					.title("Spring Boot 3.4 实战")
					.author("张技术")
					.isbn("999-1-121-12345-1")
					.price(new BigDecimal("89.90"))
					.categoryId(category.getId())
					.publicationDate(LocalDate.of(2020,5,1))
					.build();
			var book2 = BookRequest.builder()
					.title("深度学习架构指南")
					.author("Dr. Smith")
					.isbn("999-2-121-12345-2")
					.price(new BigDecimal("12500.00"))
					.categoryId(category.getId())
					.publicationDate(LocalDate.of(2021,5,1))
					.build();
			var book3 = BookRequest.builder()
					.title("轻量微服务入门")
					.author("李老师")
					.isbn("999-3-121-12345-3")
					.price(new BigDecimal("15.55"))
					.categoryId(category.getId())
					.publicationDate(LocalDate.of(2022,5,1))
					.build();
			var book4 = BookRequest.builder()
					.title("Cloud Native Patterns")
					.author("Cornelia Davis")
					.isbn("999-4-121-12345-4")
					.price(new BigDecimal("345.00"))
					.categoryId(category.getId())
					.publicationDate(LocalDate.of(2020,7,1))
					.build();
			var book5 = BookRequest.builder()
					.title("数码摄影艺术")
					.author("王老师")
					.isbn("777-1-121-12345-0")
					.price(new BigDecimal("199.99"))
					.categoryId(category.getId())
					.publicationDate(LocalDate.of(2020,3,1))
					.build();
			bookService.save(book1);
			bookService.save(book2);
			bookService.save(book3);
			bookService.save(book4);
			bookService.save(book5);
		};
	}
}
