package com.blazeneuro;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.noties.prism4j.GrammarLocator;
import io.noties.prism4j.Prism4j;

import io.noties.prism4j.languages.Prism_clike;
import io.noties.prism4j.languages.Prism_java;
import io.noties.prism4j.languages.Prism_javascript;
import io.noties.prism4j.languages.Prism_json;
import io.noties.prism4j.languages.Prism_kotlin;
import io.noties.prism4j.languages.Prism_markup;

public class MyPrismGrammarLocator implements GrammarLocator {

  @SuppressWarnings("ConstantConditions")
  private static final Prism4j.Grammar NULL =
      new Prism4j.Grammar() {
        @NotNull
        @Override
        public String name() {
          return null;
        }

        @NotNull
        @Override
        public List<Prism4j.Token> tokens() {
          return null;
        }
      };

  private final Map<String, Prism4j.Grammar> cache = new HashMap<>(3);

  @Nullable
  @Override
  public Prism4j.Grammar grammar(@NotNull Prism4j prism4j, @NotNull String language) {

    final String name = realLanguageName(language);

    Prism4j.Grammar grammar = cache.get(name);
    if (grammar != null) {
      if (NULL == grammar) {
        grammar = null;
      }
      return grammar;
    }

    grammar = obtainGrammar(prism4j, name);
    if (grammar == null) {
      cache.put(name, NULL);
    } else {
      cache.put(name, grammar);
      triggerModify(prism4j, name);
    }

    return grammar;
  }

  @NotNull
  protected String realLanguageName(@NotNull String name) {
    final String out;
    switch (name) {
      case "xml":
      case "html":
      case "mathml":
      case "svg":
        out = "markup";
        break;
      case "js":
        out = "javascript";
        break;
      case "jsonp":
        out = "json";
        break;
      default:
        out = name;
    }
    return out;
  }

  @Nullable
  protected Prism4j.Grammar obtainGrammar(@NotNull Prism4j prism4j, @NotNull String name) {
    final Prism4j.Grammar grammar;
    switch (name) {
      case "clike":
        grammar = Prism_clike.create(prism4j);
        break;
      case "java":
        grammar = Prism_java.create(prism4j);
        break;
      case "javascript":
        grammar = Prism_javascript.create(prism4j);
        break;
      case "json":
        grammar = Prism_json.create(prism4j);
        break;
      case "kotlin":
        grammar = Prism_kotlin.create(prism4j);
        break;
      case "markup":
        grammar = Prism_markup.create(prism4j);
        break;
      default:
        grammar = null;
    }
    return grammar;
  }

  protected void triggerModify(@NotNull Prism4j prism4j, @NotNull String name) {
    switch (name) {
      case "markup":
        prism4j.grammar("javascript");
        break;
    }
  }

  @Override
  @NotNull
  public Set<String> languages() {
    final Set<String> set = new HashSet<String>(6);
    set.add("clike");
    set.add("java");
    set.add("javascript");
    set.add("json");
    set.add("kotlin");
    set.add("markup");
    return set;
  }
}
