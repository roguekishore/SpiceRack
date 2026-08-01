package com.example.springapp.config;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;

public class MySqlNativeRuntimeHints implements RuntimeHintsRegistrar {

	private static final String[] REFLECTIVE_TYPES = {
			"com.mysql.cj.PerConnectionLRUFactory",
			"com.mysql.cj.util.PerVmServerConfigCacheFactory",
			"com.mysql.cj.jdbc.Driver",
			"com.mysql.cj.jdbc.NonRegisteringDriver"
	};

	@Override
	public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
		for (String type : REFLECTIVE_TYPES) {
			hints.reflection().registerType(
					TypeReference.of(type),
					MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
					MemberCategory.INVOKE_PUBLIC_METHODS);
		}
	}
}
